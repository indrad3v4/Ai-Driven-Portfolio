/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateArcadeSprite, generateBattleScene, getTrendingAIKeywords, editArcadeSprite, getGameStrategyTip, getLocationContext } from './services/gemini';
import { UploadedImage, ProcessingState, SpriteType, Difficulty, LevelStats, GameSprite } from './types';
import CRTScreen from './components/CRTScreen';
import RetroButton from './components/RetroButton';
import GameCanvas from './components/GameCanvas';
import LevelRecap from './components/LevelRecap';
import { initAudio, playCountdownBeep, playGoSignal } from './services/sound';
import { useTheme } from './hooks/useTheme';
import { InsightCartridge, createEmptyCartridge } from './lib/insight-object';
import SystemWorkspace from './components/SystemWorkspace';
import SystemArchive from './components/SystemArchive';
import BossRaidCalendar from './components/BossRaidCalendar';

// --- REUSABLE COMPONENTS ---

// WEBVIEW WARNER (Detects Social Browsers)
interface WebViewWarnerProps {
    status: 'OK' | 'WARNING' | 'BROKEN';
    appName: string | null;
}

const WebViewWarner: React.FC<WebViewWarnerProps> = ({ status, appName }) => {
    if (status === 'OK') return null;

    // Helper to attempt external open
    const openExternal = () => {
        // Fallback for Android (Intent Scheme)
        if (/Android/i.test(navigator.userAgent)) {
            window.location.href = `intent:${window.location.href}#Intent;end`;
        } else {
            // iOS/Generic - attempt pop-up, though often blocked
            alert(`Please tap the menu icon (•••) and select "Open in Browser" to escape ${appName || 'this app'}.`);
        }
    };

    if (status === 'BROKEN') {
        return (
            <div className="fixed inset-0 z-[9999] bg-[var(--accent-ruby-900)]/95 text-white flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl animate-in zoom-in duration-300">
                <div className="text-6xl mb-4 animate-pulse">⚠️</div>
                <h2 className="font-display text-4xl mb-2 tracking-widest text-[var(--accent-topaz-300)]">CRITICAL FAILURE</h2>
                <p className="font-mono text-sm mb-6 max-w-md leading-relaxed">
                    The {appName || 'Social Media'} browser has severed the neural link (API Connection). 
                    The AI cannot operate in this restricted environment.
                </p>
                <button 
                    onClick={openExternal}
                    className="px-6 py-4 bg-white text-[var(--accent-ruby-900)] font-bold font-mono rounded shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-transform"
                >
                    OPEN IN SYSTEM BROWSER
                </button>
                <p className="mt-8 text-[10px] font-mono opacity-50">
                    Tap ••• (Menu) {'>'} Open in Browser
                </p>
            </div>
        );
    }

    // WARNING STATE (Slim Bar)
    return (
        <div className="fixed top-0 left-0 w-full z-[9999] bg-[var(--accent-topaz-500)] text-[var(--bg-void)] px-3 py-2 flex justify-between items-center shadow-[0_0_20px_var(--accent-topaz-500)] animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2 font-bold font-mono text-[10px] md:text-xs">
                <span className="animate-pulse">⚠️</span>
                <span>RUNNING IN {appName ? appName.toUpperCase() : 'APP BROWSER'}. AI MAY BE UNSTABLE.</span>
            </div>
            <button 
                onClick={openExternal}
                className="text-[9px] font-mono font-bold border border-[var(--bg-void)] px-2 py-1 rounded hover:bg-[var(--bg-void)] hover:text-[var(--accent-topaz-500)] transition-colors"
            >
                OPEN EXTERNAL
            </button>
        </div>
    );
};

// HEADER COMPONENT (INDRA AI BRANDING)
const Header: React.FC<{ onCalendarClick: () => void }> = ({ onCalendarClick }) => {
    const { theme, toggleTheme } = useTheme();
    
    return (
        <header className="h-14 flex items-center justify-between px-4 border-b border-[var(--line-soft)] bg-[var(--bg-void)]/90 backdrop-blur-md z-50 pointer-events-auto relative shrink-0">
            <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-amethyst-500)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-amethyst-500)]"></span>
                </div>
                <h1 className="font-[var(--font-display)] text-2xl text-[var(--text-primary)] tracking-widest leading-none mt-1">
                    INDRA-AI.DEV
                </h1>
            </div>
            
            <div className="flex items-center gap-2">
                 <button
                    onClick={onCalendarClick}
                    className="px-3 py-1 rounded-[var(--radius-full)] bg-[var(--bg-surface)] text-[var(--accent-emerald-500)] border border-[var(--border-soft)] hover:border-[var(--accent-emerald-500)] hover:shadow-[var(--shadow-glow-emerald)] transition-all font-mono text-[10px] font-bold tracking-wider flex items-center gap-2"
                 >
                    <span>📅</span> BOSS RAID
                 </button>
                 <button 
                    onClick={toggleTheme}
                    className="px-3 py-1 rounded-[var(--radius-full)] bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-soft)] hover:border-[var(--border-glow)] transition-all font-mono text-[10px] font-semibold tracking-wider flex items-center gap-2"
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </header>
    );
};

// INTRO ANIMATION
const IntroAnimation: React.FC<{ onComplete: () => void; onImpact: () => void }> = ({ onComplete, onImpact }) => {
  const [phase, setPhase] = useState<'BIOS' | 'VOID' | 'DROP' | 'IMPACT' | 'SHATTER'>('BIOS');
  
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('VOID'), 2500);
    const t2 = setTimeout(() => setPhase('DROP'), 6000);
    const t3 = setTimeout(() => setPhase('IMPACT'), 6800);
    const t4 = setTimeout(() => {
        setPhase('SHATTER');
        onImpact();
    }, 7000);
    const t5 = setTimeout(onComplete, 9500);

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700 bg-[var(--bg-void)] ${phase === 'SHATTER' ? 'pointer-events-none bg-transparent' : ''}`}>
       <style>{`
         @keyframes biosText {
            0% { opacity: 0; transform: scale(0.95); }
            10% { opacity: 1; transform: scale(1); }
            90% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.1); }
         }
       `}</style>

       {/* PHASE 1: BIOS SCREEN */}
       {phase === 'BIOS' && (
           <div className="flex flex-col items-center justify-center w-full h-full animate-[biosText_2.4s_ease-in-out_forwards]">
               <div className="text-[var(--accent-amethyst-500)] font-display text-4xl md:text-8xl tracking-[0.1em] drop-shadow-md mb-4 text-center px-4 leading-relaxed font-bold">
                   INDRA <span className="text-white">AI</span>
               </div>
           </div>
       )}
    </div>
  );
};

// MAIN APP STATES
type AppState = 'SETUP' | 'SYSTEMATIZING' | 'GAMEPLAY' | 'RECAP' | 'VICTORY';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('SETUP');
  const [showIntro, setShowIntro] = useState(true);
  const [uiVisible, setUiVisible] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialDossierId, setInitialDossierId] = useState<string | null>(null);
  
  // WebView & Network State
  const [connectionStatus, setConnectionStatus] = useState<'OK' | 'WARNING' | 'BROKEN'>('OK');
  const [detectedApp, setDetectedApp] = useState<string | null>(null);

  // Cartridge State (The core data structure)
  const [cartridge, setCartridge] = useState<InsightCartridge>(createEmptyCartridge());
  
  // Game State
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameStats, setGameStats] = useState<LevelStats | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  
  // Theme
  const { theme } = useTheme();

  // BROWSER & DEEP LINK CHECK
  useEffect(() => {
      // 1. Check for Social Browsers (Expanded List)
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      const appPatterns = [
          { name: 'Instagram', regex: /Instagram/i },
          { name: 'Facebook', regex: /FBAN|FBAV/i },
          { name: 'LinkedIn', regex: /LinkedIn/i },
          { name: 'Twitter', regex: /Twitter|Trident/i }, // Trident covers X in-app
          { name: 'TikTok', regex: /TikTok|Musical_ly|Bytedance/i },
          { name: 'Snapchat', regex: /Snapchat/i },
          { name: 'Discord', regex: /Discord/i },
          { name: 'Slack', regex: /Slack/i },
          { name: 'WhatsApp', regex: /WhatsApp/i },
          { name: 'WeChat', regex: /WeChat|MicroMessenger/i },
          { name: 'Line', regex: /Line\//i },
          { name: 'Pinterest', regex: /Pinterest/i },
          // Generic Android WebView heuristic: "; wv" is present in webviews but not Chrome/Firefox
          { name: 'Android App', regex: /Android.*\; wv/i },
      ];

      const match = appPatterns.find(p => p.regex.test(ua));
      
      if (match) {
          setDetectedApp(match.name);
          setConnectionStatus('WARNING'); // Probationary Access
      }

      // 2. Check for Deep Linking
      const params = new URLSearchParams(window.location.search);
      const portfolioId = params.get('portfolio');
      if (portfolioId) {
          setInitialDossierId(portfolioId);
          setShowArchive(true);
          // Skip intro if deep linking for faster access
          setShowIntro(false);
          setUiVisible(true);
      }
  }, []);

  const handleNetworkError = () => {
      // Escalation Protocol: If already warned, go to BROKEN. 
      // If assumed OK but failed specifically on network, also go to BROKEN (could be undetected webview).
      setConnectionStatus('BROKEN');
  };

  // SYNC APP STATE WITH CARTRIDGE STATUS
  useEffect(() => {
    if (cartridge.status === 'GAMEPLAY' && appState !== 'GAMEPLAY') {
      setAppState('GAMEPLAY');
    }
  }, [cartridge.status]);

  const handleInsertMind = () => {
      // Transition to Systematization (Workspace)
      setAppState('SYSTEMATIZING');
      setCartridge(prev => ({ ...prev, status: 'SYSTEMATIZING' }));
      setShowArchive(false); // Ensure archive is closed if coming from there
  };

  const handleStartTechTask = () => {
      // Initialize a new cartridge in TECH_TASK mode
      setCartridge(createEmptyCartridge('TECH_TASK'));
      setAppState('SYSTEMATIZING');
      setShowCalendar(false);
      setShowArchive(false);
  };

  const handleLevelComplete = (stats: LevelStats) => {
    setGameStats(stats);
    setAppState('RECAP');
  };

  const handleGameOver = (stats: LevelStats) => {
    setGameStats(stats);
    setAppState('RECAP');
  };

  const handleNextLevel = () => {
    if (levelIndex >= 2) {
        setAppState('VICTORY');
        // Reset or show credits
        setCartridge(prev => ({ ...prev, status: 'COMPLETE' }));
    } else {
        setLevelIndex(prev => prev + 1);
        setAppState('GAMEPLAY');
    }
  };

  const handleRetryLevel = () => {
      setAppState('GAMEPLAY');
  };

  const handleHome = () => {
      setAppState('SYSTEMATIZING');
      setCartridge(prev => ({ ...prev, status: 'SYSTEMATIZING' }));
  };

  const renderCarouselContent = () => {
    switch (carouselIndex) {
        case 0: // TUTORIAL
            return (
                <div className="w-full flex flex-col gap-2 font-mono text-[10px] justify-center h-full px-1">
                     <div className="flex justify-between items-center border-b border-[var(--line-soft)] pb-2">
                         <span className="text-[var(--text-muted)] tracking-wider">MODE</span>
                         <span className="text-[var(--accent-emerald-500)] font-bold">TUTORIAL</span>
                     </div>
                     <div className="flex flex-col gap-1 mt-1">
                         <div className="flex justify-between">
                            <span className="text-[var(--text-primary)]">20 CREDITS</span>
                            <span className="text-[var(--accent-emerald-500)] font-bold">(FREE)</span>
                         </div>
                         <p className="text-[var(--text-secondary)] leading-tight text-[9px] mt-1">
                             Use 5 turns to unlock the Cabinet. Explore your insight.
                         </p>
                     </div>
                </div>
            );
        case 1: // ARCADE
            return (
                <div className="w-full flex flex-col gap-2 font-mono text-[10px] justify-center h-full px-1">
                     <div className="flex justify-between items-center border-b border-[var(--line-soft)] pb-2">
                         <span className="text-[var(--text-muted)] tracking-wider">MODE</span>
                         <span className="text-[var(--accent-topaz-500)] font-bold">ARCADE</span>
                     </div>
                     <div className="flex flex-col gap-1 mt-1">
                         <div className="flex justify-between">
                            <span className="text-[var(--text-primary)]">€0.99</span>
                            <span className="text-[var(--accent-topaz-500)] font-bold">10 CREDITS</span>
                         </div>
                         <p className="text-[var(--text-secondary)] leading-tight text-[9px] mt-1">
                             Pay-as-you-play. Continue building your system.
                         </p>
                     </div>
                </div>
            );
        case 2: // BOSS RAID
            return (
                <div className="w-full flex flex-col gap-2 font-mono text-[10px] justify-center h-full px-1">
                     <div className="flex justify-between items-center border-b border-[var(--line-soft)] pb-2">
                         <span className="text-[var(--text-muted)] tracking-wider">MODE</span>
                         <span className="text-[var(--accent-ruby-500)] font-bold">BOSS RAID</span>
                     </div>
                     <div className="flex flex-col gap-1 mt-1">
                         <div className="flex justify-between">
                            <span className="text-[var(--text-primary)]">€50/HOUR</span>
                            <span className="text-[var(--accent-ruby-500)] font-bold">CO-OP</span>
                         </div>
                         <p className="text-[var(--text-secondary)] leading-tight text-[9px] mt-1">
                             Co-op with Indra against your BOSS | 📅 Book time
                         </p>
                     </div>
                </div>
            );
        default:
            return null;
    }
};

  // Intro Animation Handlers
  const handleIntroImpact = useCallback(() => setUiVisible(true), []);
  const handleIntroComplete = useCallback(() => setShowIntro(false), []);

  return (
    <div className="relative h-dvh w-full flex flex-col overflow-hidden bg-[var(--bg-void)] font-body text-[var(--text-primary)]">
      {/* WARNING BANNER */}
      <WebViewWarner status={connectionStatus} appName={detectedApp} />

      {/* HEADER */}
      <Header onCalendarClick={() => setShowCalendar(true)} />

      {/* Archive Modal */}
      {showArchive && (
        <SystemArchive 
            onClose={() => {
                setShowArchive(false);
                setInitialDossierId(null); // Reset deep link
            }}
            onOpenCalendar={() => {
                setShowArchive(false);
                setShowCalendar(true);
            }}
            onStartGame={handleInsertMind}
            initialDossierId={initialDossierId}
        />
      )}

      {/* Calendar Modal */}
      {showCalendar && (
          <BossRaidCalendar 
            isAdmin={isAdmin} 
            onClose={() => setShowCalendar(false)} 
            onStartTechTask={handleStartTechTask} 
          />
      )}

      {/* Intro Overlay */}
      {showIntro && <IntroAnimation onImpact={handleIntroImpact} onComplete={handleIntroComplete} />}

      {/* MAIN CONTENT CONTAINER */}
      <div className={`flex-1 relative w-full h-full overflow-hidden p-2 md:p-4 transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${uiVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0 blur-3xl'}`}>
          
          {/* DECORATIVE BORDER LAYER */}
          <div className="absolute inset-0 md:inset-2 z-20 pointer-events-none border-[4px] md:border-[6px] border-[var(--accent-amethyst-500)] shadow-[0_0_30px_var(--accent-amethyst-500),inset_0_0_30px_rgba(157,78,221,0.3)] rounded-[2px]">
               <div className="absolute top-[-2px] left-[-2px] w-8 h-8 md:w-16 md:h-16 border-t-[6px] border-l-[6px] border-[var(--accent-emerald-500)]"></div>
               <div className="absolute top-[-2px] right-[-2px] w-8 h-8 md:w-16 md:h-16 border-t-[6px] border-r-[6px] border-[var(--accent-emerald-500)]"></div>
               <div className="absolute bottom-[-2px] left-[-2px] w-8 h-8 md:w-16 md:h-16 border-b-[6px] border-l-[6px] border-[var(--accent-emerald-500)]"></div>
               <div className="absolute bottom-[-2px] right-[-2px] w-8 h-8 md:w-16 md:h-16 border-b-[6px] border-r-[6px] border-[var(--accent-emerald-500)]"></div>
               <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.1)50%)] bg-[length:100%_4px] opacity-20 z-10"></div>
          </div>

          {/* --- STATE: LANDING PAGE (SETUP) --- */}
          {appState === 'SETUP' && (
            <div className="w-full h-full relative z-10 flex flex-col items-center justify-between py-4 px-3 md:py-8 md:px-8 animate-in fade-in duration-700">
                 
                 {/* 1. HERO TEXT */}
                 <div className="text-center shrink-0 mb-1 w-full max-w-full">
                     <p className="font-mono text-[10px] md:text-sm text-[var(--accent-sapphire-300)] tracking-[0.1em] uppercase mb-1">
                         YOUR INSIGHT IS DYING. LET'S MAKE IT REAL.
                     </p>
                     <h1 className="font-display text-7xl md:text-9xl lg:text-[10rem] tracking-tighter leading-none text-white drop-shadow-[0_0_25px_rgba(157,78,221,0.8)] animate-pulse mb-2 scale-y-110" style={{ textShadow: "0 0 10px var(--accent-amethyst-500)" }}>
                         INSERT MIND
                     </h1>
                 </div>

                 {/* 2. 4D SYSTEM ENGINE VISUALIZER */}
                 <div className="flex-1 w-full max-w-xl min-h-0 flex flex-col justify-center my-2">
                    <div className="w-full h-full max-h-full border-2 border-[var(--accent-topaz-500)] bg-[rgba(245,158,11,0.03)] rounded relative overflow-hidden flex flex-col shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        <div className="bg-[rgba(245,158,11,0.1)] border-b border-[var(--accent-topaz-500)] p-2 text-center shrink-0">
                            <div className="font-mono text-[10px] md:text-sm text-[var(--accent-topaz-500)] tracking-widest font-bold uppercase flex items-center justify-center gap-2">
                                <span className="animate-pulse">⚡</span> GAME SETUP
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col min-h-0 relative">
                            {/* QUADRANT VISUAL */}
                            <div className="flex-1 relative border-b border-[var(--line-soft)] bg-[var(--bg-void)]/80 shadow-inner overflow-hidden group">
                                <div className="absolute inset-0 z-10 grid grid-cols-2 grid-rows-2">
                                    <div className="border-r border-b border-transparent hover:border-[var(--accent-amethyst-500)]/30 hover:bg-[var(--accent-amethyst-500)]/10 transition-all duration-300"></div>
                                    <div className="border-l border-b border-transparent hover:border-[var(--accent-emerald-500)]/30 hover:bg-[var(--accent-emerald-500)]/10 transition-all duration-300"></div>
                                    <div className="border-r border-t border-transparent hover:border-[var(--accent-sapphire-500)]/30 hover:bg-[var(--accent-sapphire-500)]/10 transition-all duration-300"></div>
                                    <div className="border-l border-t border-transparent hover:border-[var(--accent-ruby-500)]/30 hover:bg-[var(--accent-ruby-500)]/10 transition-all duration-300"></div>
                                </div>
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[var(--line-soft)] opacity-50 z-0"></div>
                                <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[var(--line-soft)] opacity-50 z-0"></div>
                                <div className="absolute top-2 left-3 z-0"><span className="font-mono text-[10px] text-[var(--accent-amethyst-500)] tracking-widest opacity-90">STRATEGY</span></div>
                                <div className="absolute top-2 right-3 z-0"><span className="font-mono text-[10px] text-[var(--accent-emerald-500)] tracking-widest opacity-90">CREATIVE</span></div>
                                <div className="absolute bottom-2 left-3 z-0"><span className="font-mono text-[10px] text-[var(--accent-sapphire-500)] tracking-widest opacity-90">PRODUCING</span></div>
                                <div className="absolute bottom-2 right-3 z-0"><span className="font-mono text-[10px] text-[var(--accent-ruby-500)] tracking-widest opacity-90">MEDIA</span></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                    <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-[0_0_15px_white] animate-[pulse_2s_ease-in-out_infinite]"></div>
                                    <div className="absolute w-12 h-12 md:w-16 md:h-16 border border-white/30 rounded-full animate-ping opacity-50"></div>
                                </div>
                            </div>

                            {/* CAROUSEL */}
                            <div className="shrink-0 bg-[var(--bg-void)]/90 p-2 md:p-3 flex flex-col gap-1 border-t border-[var(--line-soft)] h-[130px] md:h-[150px]">
                                <div className="flex justify-between items-center px-4 mb-1 shrink-0">
                                    <button onClick={() => setCarouselIndex((i) => (i - 1 + 3) % 3)} className="text-[var(--accent-topaz-500)] hover:text-white transition-colors text-2xl font-bold">
                                        {'<'}
                                    </button>
                                    <div className="flex gap-2">
                                        {[0, 1, 2].map(idx => (
                                            <button key={idx} onClick={() => setCarouselIndex(idx)} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${carouselIndex === idx ? 'bg-[var(--accent-topaz-500)] scale-125 shadow-[0_0_8px_var(--accent-topaz-500)]' : 'bg-[var(--line-soft)] hover:bg-[var(--text-muted)]'}`} />
                                        ))}
                                    </div>
                                    <button onClick={() => setCarouselIndex((i) => (i + 1) % 3)} className="text-[var(--accent-topaz-500)] hover:text-white transition-colors text-2xl font-bold">
                                        {'>'}
                                    </button>
                                </div>
                                <div className="flex-1 flex items-center justify-center px-2 min-h-0">
                                    {renderCarouselContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* 3. INSERT MIND BUTTON */}
                 <div className="w-full max-w-md z-30 shrink-0 mt-2 mb-2">
                     <button 
                        onClick={handleInsertMind} 
                        className="w-full py-4 md:py-5 bg-[var(--accent-amethyst-500)] text-[var(--text-inverse)] font-display font-bold text-3xl md:text-4xl rounded shadow-[0_0_30px_rgba(157,78,221,0.5)] hover:bg-[var(--accent-amethyst-500)]/90 hover:scale-[1.02] transition-all active:scale-95 border border-[var(--border-glow)] tracking-widest relative overflow-hidden group"
                     >
                         <span className="relative z-10 group-hover:text-white transition-colors">
                             INSERT MIND (FREE TRIAL)
                         </span>
                         <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:text-white transition-transform duration-500 ease-in-out skew-x-12"></div>
                     </button>
                     <div className="text-[9px] md:text-xs text-center uppercase tracking-widest text-[var(--accent-ruby-500)] font-mono mt-2 opacity-80">
                        * MUST BE A BEST PROJECT IN YOUR LIFE *
                     </div>
                     <div className="mt-2 text-center cursor-pointer group" onClick={() => setShowArchive(true)}>
                         <span className="font-mono text-[10px] md:text-xs text-[var(--text-muted)] group-hover:text-[var(--accent-topaz-500)] transition-colors uppercase tracking-wider">
                             ⚓ RAID VICTORIES_ (PORTFOLIO)
                         </span>
                     </div>
                 </div>
            </div>
          )}

          {/* --- STATE: SYSTEMATIZING (MAIN WORKSPACE) --- */}
          {appState === 'SYSTEMATIZING' && (
              <div className="relative z-10 w-full h-full flex flex-col p-2 md:p-4 animate-in zoom-in-95 duration-500">
                  <div className="flex-1 min-h-0 relative">
                       <SystemWorkspace 
                          cartridge={cartridge}
                          onUpdate={setCartridge}
                          theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                          onAdminGrant={() => setIsAdmin(true)}
                          onNetworkError={handleNetworkError}
                       />
                  </div>
              </div>
          )}

          {/* --- STATE: GAMEPLAY (REWARD) --- */}
          {appState === 'GAMEPLAY' && (
             <div className="relative z-10 w-full h-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-500">
                 <div className="w-full h-full max-w-6xl max-h-full">
                     <GameCanvas 
                        appState="PLAYING"
                        difficulty={difficulty}
                        speedModifier={1}
                        currentLevelIndex={levelIndex}
                        viewMode="2D"
                        theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                        playerSpriteUrl={cartridge.hero.avatar}
                        villainSpriteUrl={cartridge.villain.avatar}
                        onLevelComplete={handleLevelComplete}
                        onGameOver={handleGameOver}
                     />
                 </div>
             </div>
          )}

          {/* --- STATE: RECAP --- */}
          {appState === 'RECAP' && gameStats && (
              <LevelRecap 
                  stats={gameStats}
                  isFinalLevel={levelIndex === 2}
                  onNextLevel={handleNextLevel}
                  onRetry={handleRetryLevel}
                  onHome={handleHome}
                  playerSpriteUrl={cartridge.hero.avatar || null}
                  villainSpriteUrl={cartridge.villain.avatar || null}
                  theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
              />
          )}

      </div>
    </div>
  );
};

export default App;
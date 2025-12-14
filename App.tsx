
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
import { useGamePortal } from './hooks/useGamePortal';
import Logo from './components/Logo';
import { ManifestoSection } from './components/ManifestoSection';
import { injectJsonLd, getSEOConfig, generateMetaTags, applyDOMMetaTags } from './lib/seo';
import ConnectionRequest from './components/ConnectionRequest';

// --- REUSABLE COMPONENTS ---

// WEBVIEW WARNER (Detects Social Browsers)
interface WebViewWarnerProps {
    status: 'OK' | 'WARNING' | 'BROKEN';
    appName: string | null;
}

const WebViewWarner: React.FC<WebViewWarnerProps> = ({ status, appName }) => {
    const [copied, setCopied] = useState(false);

    // If OK, show nothing
    if (status === 'OK') return null;

    // Helper to attempt external open
    const openExternal = () => {
        // 1. Get current URL, ensure it's clean
        const url = window.location.href;
        
        // 2. Android Strategy: "Intent Bomb" with fallback
        if (/Android/i.test(navigator.userAgent)) {
            const cleanUrl = url.replace(/^https?:\/\//, '');
            // Force Chrome. S.browser_fallback_url triggers if Chrome isn't found.
            // We use scheme=https to ensure it opens as a web page, not a search.
            const intent = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
            window.location.href = intent;
        } 
        // 3. iOS Strategy: "Polite Request"
        else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            // iOS is stricter. We try the googlechrome:// scheme first.
            const chromeUrl = `googlechrome://${url.replace(/^https?:\/\//, '')}`;
            window.location.href = chromeUrl;
            
            // Fallback: iOS Safari "Open in Browser" usually requires user action in the menu.
        } 
        // 4. Desktop/Other
        else {
            window.open(url, '_system');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // RED STATE: SIGNAL JAMMED (Blocking) - Only happens if API actually fails
    if (status === 'BROKEN') {
        return (
            <div className="fixed inset-0 z-[9999] bg-[var(--bg-void)] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
                {/* Visual Glitch Effect */}
                <div className="text-6xl mb-4 animate-pulse relative">
                    📡
                    <span className="absolute top-0 left-0 animate-ping opacity-50">📡</span>
                </div>
                
                <h2 className="font-display text-4xl mb-4 tracking-widest text-[var(--accent-ruby-500)] manga-text-stroke" data-text="SIGNAL LOST">
                    SIGNAL LOST
                </h2>

                <div className="p-6 border-2 border-[var(--accent-ruby-500)] bg-[var(--accent-ruby-500)]/10 rounded-lg max-w-md mb-8 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                    <p className="font-mono text-sm leading-relaxed mb-4 text-[var(--text-primary)]">
                        The Neural Link failed inside <strong>{appName || 'THIS APP'}</strong>.
                        <br/><br/>
                        Social browsers (especially Telegram/IG) block AI connections. You must eject to the system browser.
                    </p>
                    <div className="h-[1px] bg-[var(--accent-ruby-500)]/50 w-full mb-4"></div>
                </div>
                
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button 
                        onClick={openExternal}
                        className="w-full py-4 bg-[var(--accent-emerald-500)] text-[var(--bg-void)] font-display font-bold text-xl rounded shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform animate-pulse"
                    >
                        OPEN IN CHROME / SAFARI
                    </button>
                    
                    <button 
                        onClick={handleCopy}
                        className="w-full py-3 bg-[var(--bg-surface)] border border-[var(--text-muted)] text-[var(--text-secondary)] font-mono text-xs rounded hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2"
                    >
                        {copied ? "COPIED! ✅" : "📋 COPY LINK MANUALLY"}
                    </button>

                    {/* iOS Specific Instruction */}
                    <div className="text-xs font-mono text-[var(--text-muted)] mt-2 border-t border-[var(--line-soft)] pt-4">
                        <span className="text-[var(--accent-topaz-500)] font-bold">MANUAL OVERRIDE:</span><br/>
                        Tap <span className="text-white font-bold border border-white/20 px-1 rounded">•••</span> or <span className="text-white font-bold border border-white/20 px-1 rounded">Share</span> <br/>
                        Then select <span className="text-white font-bold">Open in Browser</span>
                    </div>
                </div>
            </div>
        );
    }

    // YELLOW STATE: CAUTION (Non-Blocking) - Educational
    // DISABLED: We trust our proxy now. Only show if BROKEN.
    return null;
};

// HEADER COMPONENT (INDRADEV_PORTFOLIO)
interface HeaderProps { 
    onCalendarClick: () => void; 
    isLanding?: boolean;
    language: 'EN' | 'PL' | 'BEL';
    setLanguage: (l: 'EN' | 'PL' | 'BEL') => void;
}

const Header: React.FC<HeaderProps> = ({ onCalendarClick, isLanding = false, language, setLanguage }) => {
    const { theme, toggleTheme } = useTheme();
    
    const HEADER_COPY = {
        EN: { cta: "HAVE A TASK? FILL TECH SPEC" },
        PL: { cta: "MASZ ZADANIE? WYPEŁNIJ SPEC" },
        BEL: { cta: "ЁСЦЬ ЗАДАЧА? ЗАПОЛНІ SPEC" }
    };

    return (
        <header className="h-14 flex items-center justify-between px-4 border-b border-[var(--line-soft)] bg-[var(--bg-void)]/90 backdrop-blur-md z-50 pointer-events-auto relative shrink-0">
            <div className="flex items-center gap-3">
                <Logo isLanding={isLanding} />
            </div>
            
            <div className="flex items-center gap-2">
                 {/* Language Selector */}
                 <div className="flex gap-1 mr-2 bg-[var(--bg-surface)] rounded-full p-1 border border-[var(--line-soft)]">
                    {(['EN', 'PL', 'BEL'] as const).map(lang => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-2 py-0.5 text-[10px] font-mono rounded-full transition-all ${language === lang ? 'bg-[var(--accent-amethyst-500)] text-white font-bold shadow-[0_0_10px_rgba(157,78,221,0.4)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            {lang}
                        </button>
                    ))}
                 </div>

                 {/* New Tech Spec CTA */}
                 <button
                    onClick={onCalendarClick}
                    className="hidden md:flex px-4 py-1.5 rounded-[var(--radius-full)] bg-[var(--bg-surface)] text-[var(--accent-sapphire-500)] border border-[var(--accent-sapphire-500)] hover:bg-[var(--accent-sapphire-500)] hover:text-white transition-all font-mono text-[10px] font-bold tracking-wider items-center gap-2 shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    title="Jump straight to technical specification -> I'll code it"
                 >
                    <span>⚡</span> {HEADER_COPY[language].cta}
                 </button>

                 {/* Mobile Icon Only */}
                 <button
                    onClick={onCalendarClick}
                    className="md:hidden px-3 py-1 rounded-[var(--radius-full)] bg-[var(--bg-surface)] text-[var(--accent-sapphire-500)] border border-[var(--accent-sapphire-500)] hover:bg-[var(--accent-sapphire-500)] hover:text-white transition-all font-mono text-[10px] font-bold tracking-wider flex items-center gap-2"
                 >
                    <span>⚡</span> SPEC
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
               <div className="text-[var(--accent-amethyst-500)] font-mono text-3xl md:text-6xl tracking-[0.1em] drop-shadow-[0_0_10px_rgba(157,78,221,0.5)] mb-2 text-center px-4 font-bold">
                   INDRADEV_PORTFOLIO
               </div>
               <div className="text-[var(--text-secondary)] font-mono text-xs md:text-base tracking-[0.2em] animate-pulse">
                   PRESS START. BUILD YOUR SYSTEM.
               </div>
           </div>
       )}
    </div>
  );
};

// MAIN APP STATES
type AppState = 'PORTFOLIO_VIEW' | 'SETUP' | 'SYSTEMATIZING' | 'GAMEPLAY' | 'RECAP' | 'VICTORY';

const App: React.FC = () => {
  // --- ZUSTAND GLOBAL STATE ---
  const { cartridge, setCartridge, portalActive, deactivatePortal } = useGamePortal();
  
  const [appState, setAppState] = useState<AppState>('SETUP');
  
  // UX PHASE STATES
  const [showIntro, setShowIntro] = useState(true);
  const [showConnectionRequest, setShowConnectionRequest] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  
  const [showArchive, setShowArchive] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialDossierId, setInitialDossierId] = useState<string | null>(null);
  const [showManifesto, setShowManifesto] = useState(false);
  
  // GLOBAL LANGUAGE STATE
  const [language, setLanguage] = useState<'EN' | 'PL' | 'BEL'>('EN');
  
  // WebView & Network State
  const [connectionStatus, setConnectionStatus] = useState<'OK' | 'WARNING' | 'BROKEN'>('OK');
  const [detectedApp, setDetectedApp] = useState<string | null>(null);

  // Game State
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameStats, setGameStats] = useState<LevelStats | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  
  // Input Focus Ref for "Ready to ship?" CTA
  const insertMindInputRef = useRef<HTMLButtonElement>(null);

  // Theme
  const { theme } = useTheme();

  // SEO Metadata Injection
  useEffect(() => {
      const seoConfig = getSEOConfig(appState === 'SETUP' ? 'landing' : 'game');
      document.title = seoConfig.title;
      
      const metaTags = generateMetaTags(seoConfig);
      applyDOMMetaTags(metaTags);
  }, [appState]);

  // PORTAL EFFECT: If logo clicked, force state to SETUP
  useEffect(() => {
    if (portalActive) {
      setAppState('SETUP');
      setShowArchive(false);
      setShowCalendar(false);
      setShowManifesto(false);
      deactivatePortal();
    }
  }, [portalActive]);

  // BROWSER & DEEP LINK CHECK
  useEffect(() => {
      // 1. Check for Social Browsers (UNIVERSAL DETECTION)
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      const appPatterns = [
          { name: 'Instagram', regex: /Instagram/i },
          { name: 'Facebook', regex: /FBAN|FBAV/i },
          { name: 'Messenger', regex: /Messenger/i },
          { name: 'Telegram', regex: /Telegram/i },
          { name: 'TikTok', regex: /TikTok|Musical_ly|Bytedance/i },
          { name: 'In-App Browser', regex: /wv|WebView/i },
      ];

      const match = appPatterns.find(p => p.regex.test(ua));
      
      if (match) {
          setDetectedApp(match.name);
      }

      // 2. Check for Deep Linking
      const params = new URLSearchParams(window.location.search);
      const portfolioId = params.get('portfolio');
      if (portfolioId) {
          setInitialDossierId(portfolioId);
          setShowArchive(true); // Still keep this logic for direct linking
          // If deep linked, skip intros
          setShowIntro(false);
          setShowConnectionRequest(false);
          setUiVisible(true);
      }
  }, []);

  const handleNetworkError = useCallback(() => {
      // Escalation Protocol: If API fails, we assume we are in a hostile WebView (like Telegram)
      console.warn("CRITICAL: Network Health Check Failed. Triggering WebView Warner.");
      
      // ESCALATE TO RED STATE (Blocking)
      setConnectionStatus('BROKEN'); 
      if (!detectedApp) {
          setDetectedApp('RESTRICTED NETWORK / WEBVIEW');
      }
  }, [detectedApp]);

  // SYNC APP STATE WITH CARTRIDGE STATUS (Only if not SETUP/Portal overrides)
  useEffect(() => {
    if (!portalActive && cartridge.status === 'GAMEPLAY' && appState !== 'GAMEPLAY') {
      setAppState('GAMEPLAY');
    }
  }, [cartridge.status, portalActive]);

  const handleInsertMind = () => {
      setAppState('SYSTEMATIZING');
      setCartridge(prev => ({ ...prev, status: 'SYSTEMATIZING' }));
      setShowArchive(false);
  };

  const handleStartTechTask = () => {
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
  
  // Callback for Manifesto CTA to start the game immediately
  const handleManifestoAction = () => {
      setShowManifesto(false);
      // If we are on landing page, focus the input or start the process
      if (appState === 'SETUP') {
        setTimeout(() => {
           handleInsertMind();
        }, 300);
      }
  };

  const renderCarouselContent = () => {
    switch (carouselIndex) {
        case 0:
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
        case 1:
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
        case 2:
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

  const handleIntroImpact = useCallback(() => {
     // Intro impact (shatter) happens, but we wait for complete before showing UI
  }, []);

  const handleIntroComplete = useCallback(() => {
      setShowIntro(false);
      // Instead of showing UI immediately, show the Connection Request
      setShowConnectionRequest(true);
  }, []);

  const handleConnectionAccepted = useCallback(() => {
      setShowConnectionRequest(false);
      setUiVisible(true);
      // NEW FLOW: Go to Portfolio View first
      setAppState('PORTFOLIO_VIEW');
  }, []);

  const handlePortfolioContinue = useCallback(() => {
      setAppState('SETUP');
  }, []);

  // COPY DICTIONARY FOR MAIN BUTTON
  const INSERT_MIND_COPY = {
      EN: "PRESS START",
      PL: "NACIŚNIJ START",
      BEL: "ЗАСНУЙ START"
  };

  return (
    <div className="relative h-dvh w-full flex flex-col overflow-hidden bg-[var(--bg-void)] font-body text-[var(--text-primary)]">
      {/* WARNING BANNER */}
      <WebViewWarner status={connectionStatus} appName={detectedApp} />

      {/* HEADER */}
      <Header 
        onCalendarClick={() => setShowCalendar(true)} 
        isLanding={appState === 'SETUP'} 
        language={language}
        setLanguage={setLanguage}
      />

      {/* Archive Modal (Standard Access) */}
      {showArchive && (
        <SystemArchive 
            onClose={() => {
                setShowArchive(false);
                setInitialDossierId(null);
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
            estimation={cartridge.mode === 'TECH_TASK' ? cartridge.techTask?.estimation : undefined}
          />
      )}

      {/* Manifesto Modal (Full Screen Overlay) */}
      {showManifesto && (
          <div className="fixed inset-0 z-[110] bg-[var(--bg-void)]/98 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300">
               <div className="min-h-full flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl">
                         <button 
                            onClick={() => setShowManifesto(false)}
                            className="absolute top-0 right-0 p-2 text-[var(--text-muted)] hover:text-white transition-colors z-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <ManifestoSection 
                            showFullManifesto={true} 
                            onAction={handleManifestoAction}
                        />
                    </div>
               </div>
          </div>
      )}

      {/* Intro Overlay */}
      {showIntro && <IntroAnimation onImpact={handleIntroImpact} onComplete={handleIntroComplete} />}

      {/* Connection Request Overlay (The "Disclaimer") */}
      {showConnectionRequest && (
          <ConnectionRequest 
            onProceed={handleConnectionAccepted} 
            language={language}
            setLanguage={setLanguage}
          />
      )}

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

          {/* --- STATE: PORTFOLIO SHOWCASE (NEW) --- */}
          {appState === 'PORTFOLIO_VIEW' && (
              <div className="relative z-30 w-full h-full animate-in fade-in duration-500">
                  <SystemArchive 
                      onClose={() => handlePortfolioContinue()} // Fallback
                      onOpenCalendar={() => setShowCalendar(true)}
                      onStartGame={handleInsertMind}
                      mode="SHOWCASE"
                      onContinue={handlePortfolioContinue}
                  />
              </div>
          )}

          {/* --- STATE: LANDING PAGE (SETUP) --- */}
          {appState === 'SETUP' && (
            <div className="w-full h-full relative z-10 flex flex-col items-center justify-between py-4 px-3 md:py-8 md:px-8 animate-in fade-in duration-700 overflow-y-auto">
                 
                 {/* 1. HERO TEXT */}
                 <div className="text-center shrink-0 mb-1 w-full max-w-full">
                     <p className="font-mono text-[10px] md:text-sm text-[var(--accent-sapphire-300)] tracking-[0.1em] uppercase mb-1">
                         YOUR INSIGHT IS DYING. LET'S MAKE IT REAL.
                     </p>
                     <h1 className="font-display text-7xl md:text-9xl lg:text-[10rem] tracking-tighter leading-none text-white drop-shadow-[0_0_25px_rgba(157,78,221,0.8)] animate-pulse mb-2 scale-y-110" style={{ textShadow: "0 0 10px var(--accent-amethyst-500)" }}>
                         INSERT MIND
                     </h1>
                 </div>

                 {/* 2. 4D SYSTEM ENGINE VISUALIZER (RESTORED) */}
                 <div className="flex-1 w-full max-w-xl min-h-0 flex flex-col justify-center my-2 shrink-0">
                    <div className="w-full h-full max-h-[400px] border-2 border-[var(--accent-topaz-500)] bg-[rgba(245,158,11,0.03)] rounded relative overflow-hidden flex flex-col shadow-[0_0_20px_rgba(245,158,11,0.1)]">
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

                 {/* 3. PRESS START BUTTON */}
                 <div className="w-full max-w-md z-30 shrink-0 mt-2 mb-2">
                     <button 
                        ref={insertMindInputRef}
                        onClick={handleInsertMind} 
                        className="w-full py-4 md:py-5 bg-[var(--accent-amethyst-500)] text-[var(--text-inverse)] font-display font-bold text-3xl md:text-4xl rounded shadow-[0_0_30px_rgba(157,78,221,0.5)] hover:bg-[var(--accent-amethyst-500)]/90 hover:scale-[1.02] transition-all active:scale-95 border border-[var(--border-glow)] tracking-widest relative overflow-hidden group"
                     >
                         <span className="relative z-10 group-hover:text-white transition-colors">
                             {INSERT_MIND_COPY[language]}
                         </span>
                         <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:text-white transition-transform duration-500 ease-in-out skew-x-12"></div>
                     </button>
                     
                     {/* MANIFESTO TOGGLE (Refined Footer Trigger) */}
                     <div className="mt-4 text-center cursor-pointer group" onClick={() => setShowManifesto(true)}>
                         <span className="font-mono text-[10px] md:text-xs text-[var(--accent-ruby-500)] group-hover:text-[var(--accent-ruby-300)] transition-colors uppercase tracking-wider flex items-center justify-center gap-2 hover:underline decoration-[var(--accent-ruby-500)] underline-offset-4">
                            * ARCHITECT YOUR LEGACY *
                         </span>
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
                          onOpenCalendar={() => setShowCalendar(true)}
                       />
                  </div>
              </div>
          )}

          {/* --- STATE: GAMEPLAY (REWARD) --- */}
          {appState === 'GAMEPLAY' && (
             <div className="relative z-10 w-full h-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-500">
                 <div className="w-full h-full max-h-full max-w-6xl">
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

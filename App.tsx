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

// --- REUSABLE COMPONENTS ---

// HEADER COMPONENT (INDRA AI BRANDING)
const Header: React.FC = () => {
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
            
             <button 
                onClick={toggleTheme}
                className="px-3 py-1 rounded-[var(--radius-full)] bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-soft)] hover:border-[var(--border-glow)] transition-all font-mono text-[10px] font-semibold tracking-wider flex items-center gap-2"
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
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

interface WorkState {
    source: UploadedImage | null;
    generated: UploadedImage | null;
    status: ProcessingState;
    progressTick: number;
}

const initialWorkState: WorkState = {
    source: null,
    generated: null,
    status: 'IDLE',
    progressTick: 0
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('SETUP');
  const [showIntro, setShowIntro] = useState(true);
  const [uiVisible, setUiVisible] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  // Cartridge State (The core data structure)
  const [cartridge, setCartridge] = useState<InsightCartridge>(createEmptyCartridge());
  
  // Game State
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameStats, setGameStats] = useState<LevelStats | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  
  // Theme
  const { theme } = useTheme();

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
        case 0: // RULES
            return (
                <div className="w-full flex flex-col gap-3 font-mono text-[9px] md:text-[10px] px-1 justify-start h-full overflow-y-auto py-1 scrollbar-thin">
                    <div className="flex flex-col gap-0.5 shrink-0">
                        <div className="flex gap-2 items-baseline">
                            <span className="text-[var(--accent-amethyst-500)] font-bold shrink-0">01.</span>
                            <span className="text-[var(--text-primary)] font-bold tracking-wide">INSERT INSIGHT CARTRIDGE</span>
                        </div>
                        <span className="pl-6 text-[var(--text-muted)] leading-tight">Define Hero (goal) + Villain (barrier)</span>
                    </div>
                    <div className="flex flex-col gap-0.5 shrink-0">
                        <div className="flex gap-2 items-baseline">
                            <span className="text-[var(--accent-amethyst-500)] font-bold shrink-0">02.</span>
                            <span className="text-[var(--text-primary)] font-bold tracking-wide">CHOOSE EXPLORATION MODE</span>
                        </div>
                         <span className="pl-6 text-[var(--text-muted)] leading-tight">Click quadrant (STRATEGY/CREATIVE/PRODUCING/MEDIA) to apply lens OR skip to brainstorm raw insight.</span>
                    </div>
                    <div className="flex flex-col gap-0.5 shrink-0">
                        <div className="flex gap-2 items-baseline">
                            <span className="text-[var(--accent-amethyst-500)] font-bold shrink-0">03.</span>
                            <span className="text-[var(--text-primary)] font-bold tracking-wide">AGENT SYSTEMATIZES</span>
                        </div>
                        <span className="pl-6 text-[var(--text-muted)] leading-tight">Agent builds your unique AI system code.</span>
                    </div>
                </div>
            );
        case 1: // PRICING
            return (
                <div className="w-full flex flex-col gap-2 font-mono text-[10px] justify-center h-full px-1">
                     <div className="flex justify-between items-center border-b border-[var(--line-soft)] pb-1">
                         <span className="text-[var(--text-muted)] tracking-wider">TUTORIAL</span>
                         <span className="text-[var(--accent-emerald-500)] font-bold">20 CREDITS (FREE)</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-[var(--line-soft)] pb-1">
                         <span className="text-[var(--text-muted)] tracking-wider">ARCADE</span>
                         <span className="text-[var(--accent-topaz-500)] font-bold">1.9 CREDITS / TURN</span>
                     </div>
                     <div className="flex justify-between items-start">
                         <span className="text-[var(--text-muted)] tracking-wider shrink-0 mr-2">BULK BUY</span>
                         <span className="text-[var(--accent-ruby-500)] font-bold text-right">$5 = 50 CREDITS</span>
                     </div>
                </div>
            );
        case 2: // SYSTEM
            return (
                <div className="w-full flex flex-col items-center justify-center gap-2 font-mono text-[10px] h-full">
                    <div className="w-full border border-[var(--accent-topaz-500)]/30 bg-[var(--accent-topaz-500)]/10 p-2 rounded text-center shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                        <span className="text-[var(--accent-topaz-500)] tracking-widest font-bold">SAVE CODE = YOUR SYSTEM</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 w-full text-center">
                        <span className="text-[var(--accent-emerald-500)] text-[9px] font-bold tracking-wide">LOAD ANYTIME. NO GAME OVER.</span>
                        <div className="w-full border-t border-[var(--line-soft)] pt-1 mt-1 flex justify-center">
                            <span className="text-[var(--accent-amethyst-500)] animate-pulse tracking-tight text-[8px] md:text-[9px] leading-tight">
                                {">"} HUGGINGFACE DEPLOY SOON
                            </span>
                        </div>
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
      {/* HEADER */}
      <Header />

      {/* Archive Modal */}
      {showArchive && <SystemArchive onClose={() => setShowArchive(false)} />}

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
                                <div className="flex justify-center gap-2 mb-1 shrink-0">
                                    {[0, 1, 2].map(idx => (
                                        <button key={idx} onClick={() => setCarouselIndex(idx)} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${carouselIndex === idx ? 'bg-[var(--accent-topaz-500)] scale-125 shadow-[0_0_8px_var(--accent-topaz-500)]' : 'bg-[var(--line-soft)] hover:bg-[var(--text-muted)]'}`} />
                                    ))}
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
                         <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out skew-x-12"></div>
                     </button>
                     <div className="text-[9px] md:text-xs text-center uppercase tracking-widest text-[var(--accent-ruby-500)] font-mono mt-2 opacity-80">
                        * MUST BE A BEST PROJECT IN YOUR LIFE *
                     </div>
                     <div className="mt-2 text-center cursor-pointer group" onClick={() => setShowArchive(true)}>
                         <span className="font-mono text-[10px] md:text-xs text-[var(--text-muted)] group-hover:text-[var(--accent-topaz-500)] transition-colors uppercase tracking-wider">
                             ⚓ SYSTEMATIZED BY INDRADEV_
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
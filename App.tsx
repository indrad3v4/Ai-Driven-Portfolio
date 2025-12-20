
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { useGamePortal } from './hooks/useGamePortal';
import { createEmptyCartridge } from './lib/insight-object';
import { getSEOConfig, applyDOMMetaTags } from './lib/seo';

// Components
import Logo from './components/Logo';
import ManifestoSection from './components/ManifestoSection';
import SystemArchive from './components/SystemArchive';
import SystemWorkspace from './components/SystemWorkspace';
import GameCanvas from './components/GameCanvas';
import LevelRecap from './components/LevelRecap';
import BossRaidCalendar from './components/BossRaidCalendar';
import CRTScreen from './components/CRTScreen';
import ErrorBoundary from './components/ErrorBoundary';
import SetupSequence from './components/SetupSequence';

const ACTION_COPY = {
  EN: {
    DISCLAIMER: "INITIATE LINK",
    PORTFOLIO: "SYNCHRONIZE",
    READY: "PRESS START"
  },
  PL: {
    DISCLAIMER: "INICJUJ ŁĄCZE",
    PORTFOLIO: "SYNCHRONIZUJ",
    READY: "NACIŚNIJ START"
  },
  BEL: {
    DISCLAIMER: "ПАЧАЦЬ ІНІЦЫЯЦЫЮ",
    PORTFOLIO: "СІНХРАНІЗАВАЦЬ",
    READY: "НАТИСНІЦЬ СТАРТ"
  }
};

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { cartridge, setCartridge, portalActive, deactivatePortal, _hasHydrated } = useGamePortal();
  
  // Navigation State
  const [appState, setAppState] = useState<'PORTFOLIO_VIEW' | 'SETUP' | 'PLAYING' | 'LEVEL_RECAP' | 'SYSTEM_WORKSPACE'>('SETUP');
  
  // Internal Setup Sequence State
  const [setupStage, setSetupStage] = useState<'DISCLAIMER' | 'PORTFOLIO' | 'READY'>('DISCLAIMER');
  
  // Modals
  const [showManifesto, setShowManifesto] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Game State
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levelStats, setLevelStats] = useState<any>(null);
  
  // UI Logic
  const [language, setLanguage] = useState<'EN' | 'PL' | 'BEL'>('EN');
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  // Portal Logic (Returning from Game to Home)
  useEffect(() => {
    if (portalActive && _hasHydrated) {
      setAppState('SETUP');
      setSetupStage('READY'); // Skip onboarding if returning
      deactivatePortal();
    }
  }, [portalActive, deactivatePortal, _hasHydrated]);

  // SEO Updates
  useEffect(() => {
    const pageKey = appState === 'SETUP' ? 'landing' : appState === 'SYSTEM_WORKSPACE' ? 'game' : 'portfolio';
    const config = getSEOConfig(pageKey);
    applyDOMMetaTags([
        { name: 'description', content: config.description },
        { property: 'og:title', content: config.title },
        { property: 'og:description', content: config.description }
    ]);
  }, [appState]);

  if (!_hasHydrated) {
    return <div className="fixed inset-0 bg-[#0a0412] flex items-center justify-center font-mono text-[#9d4edd]">INITIATING UPLINK...</div>;
  }

  // Unified Progression Handler
  const handlePrimaryAction = () => {
    if (setupStage === 'DISCLAIMER') {
      setSetupStage('PORTFOLIO');
    } else if (setupStage === 'PORTFOLIO') {
      setSetupStage('READY');
    } else if (setupStage === 'READY') {
      if (!cartridge || cartridge.status === 'EMPTY') {
        const newCartridge = createEmptyCartridge('STRATEGY_SESSION');
        setCartridge(newCartridge);
      }
      setAppState('SYSTEM_WORKSPACE');
    }
  };

  const handleLevelComplete = (stats: any) => {
    setLevelStats(stats);
    setAppState('LEVEL_RECAP');
  };

  const handleNextLevel = () => {
      if (currentLevelIndex < 2) {
          setCurrentLevelIndex(prev => prev + 1);
          setAppState('PLAYING');
      } else {
          setAppState('SYSTEM_WORKSPACE');
      }
  };

  return (
    <ErrorBoundary>
      <div className={`fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[var(--bg-void)] text-[var(--text-primary)] font-body flex flex-col`}>
          
          {/* GLOBAL HEADER */}
          <header className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-center pointer-events-none">
              <div className="pointer-events-auto">
                  <Logo isLanding={appState === 'SETUP'} />
              </div>
              <div className="pointer-events-auto flex items-center gap-4">
                  <button onClick={toggleTheme} className="opacity-50 hover:opacity-100 transition-opacity p-2 bg-[var(--bg-overlay)]/50 rounded-full border border-[var(--line-soft)]">
                      {theme === 'DARK' ? '☀' : '☾'}
                  </button>
              </div>
          </header>

          {/* --- MODALS --- */}
          {showManifesto && (
               <div className="fixed inset-0 z-[60] bg-[var(--bg-void)] flex flex-col">
                  <div className="p-4 flex justify-end">
                      <button onClick={() => setShowManifesto(false)} className="text-[var(--text-muted)] hover:text-white px-4 py-2 border border-[var(--line-soft)] rounded font-mono text-xs">✕ CLOSE</button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <ManifestoSection onAction={() => { setShowManifesto(false); handlePrimaryAction(); }} />
                  </div>
               </div>
          )}

          {showArchive && (
              <SystemArchive 
                  onClose={() => setShowArchive(false)}
                  onOpenCalendar={() => setShowCalendar(true)}
                  onStartGame={() => { setShowArchive(false); handlePrimaryAction(); }}
              />
          )}

          {showCalendar && (
              <BossRaidCalendar 
                  onClose={() => setShowCalendar(false)} 
                  isAdmin={false} 
                  onStartTechTask={() => {
                      const newCartridge = createEmptyCartridge('TECH_TASK');
                      setCartridge(newCartridge);
                      setShowCalendar(false);
                      setAppState('SYSTEM_WORKSPACE');
                  }}
              />
          )}

          {/* --- MAIN CONTENT --- */}
          <main className="flex-1 relative w-full h-full">
              
              {/* 0. PORTFOLIO VIEW */}
              {appState === 'PORTFOLIO_VIEW' && (
                <div className="relative z-[70] w-full h-full animate-in fade-in duration-500 bg-[var(--bg-void)]">
                    <SystemArchive 
                        onClose={() => setAppState('SETUP')} 
                        onOpenCalendar={() => setShowCalendar(true)}
                        onStartGame={() => setAppState('SETUP')} 
                        mode="SHOWCASE"
                        onContinue={() => setAppState('SETUP')}
                    />
                </div>
              )}

              {/* 1. LANDING PAGE */}
              {appState === 'SETUP' && (
                  <div className="w-full h-full relative z-10 flex flex-col items-center justify-between py-4 px-3 md:py-8 md:px-8 animate-in fade-in duration-700 overflow-y-auto overflow-x-hidden">
                       <div className="text-center shrink-0 mb-1 w-full max-w-full mt-16 md:mt-0">
                           <p className="font-mono text-[10px] md:text-sm text-[var(--accent-sapphire-300)] tracking-[0.1em] uppercase mb-1">
                               YOUR INSIGHT IS DYING.
                           </p>
                           <h1 className="font-display text-4xl md:text-7xl lg:text-9xl tracking-tighter leading-none text-white drop-shadow-[0_0_25px_rgba(157,78,221,0.8)] animate-pulse mb-2 scale-y-110" style={{ textShadow: "0 0 10px var(--accent-amethyst-500)" }}>
                               LET'S MAKE IT REAL
                           </h1>
                       </div>

                       {/* THE ONBOARDING BOX */}
                       <div className="flex-1 w-full max-w-xl min-h-0 flex flex-col justify-center my-2 shrink-0">
                          <div className="w-full h-full max-h-[480px] border-2 border-[var(--accent-topaz-500)] bg-[rgba(245,158,11,0.03)] rounded relative overflow-hidden flex flex-col shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all">
                              <div className="bg-[rgba(245,158,11,0.1)] border-b border-[var(--accent-topaz-500)] p-2 text-center shrink-0 flex justify-between items-center px-4">
                                  <div className="font-mono text-[10px] md:text-xs text-[var(--accent-topaz-500)] tracking-widest font-bold uppercase flex items-center gap-2">
                                      <span className="animate-pulse">⚡</span> SYSTEM_{setupStage}
                                  </div>
                                  <div className="flex gap-1">
                                      {['EN','PL','BEL'].map(l => (
                                          <button 
                                              key={l}
                                              onClick={() => setLanguage(l as any)}
                                              className={`text-[8px] px-1.5 py-0.5 border font-mono transition-colors ${language === l ? 'bg-[var(--accent-topaz-500)] text-black border-[var(--accent-topaz-500)]' : 'text-[var(--text-muted)] border-[var(--line-soft)] hover:text-white'}`}
                                          >
                                              {l}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                              
                              <div className="flex-1 flex flex-col min-h-0 relative bg-[var(--bg-void)]/90">
                                  <SetupSequence 
                                      stage={setupStage} 
                                      language={language}
                                      onOpenArchive={() => setAppState('PORTFOLIO_VIEW')}
                                  />
                              </div>
                          </div>
                       </div>

                       {/* THE IGNITION BUTTON */}
                       <div className="w-full max-w-md z-30 shrink-0 mt-2 mb-12">
                           <button 
                              ref={actionButtonRef}
                              onClick={handlePrimaryAction} 
                              className={`w-full py-4 md:py-5 font-display font-bold text-3xl md:text-4xl rounded transition-all border tracking-widest relative overflow-hidden group active:scale-95 ${
                                  setupStage === 'READY' 
                                  ? 'bg-[var(--accent-amethyst-500)] text-[var(--text-inverse)] border-[var(--border-glow)] shadow-[0_0_30px_rgba(157,78,221,0.5)]' 
                                  : setupStage === 'PORTFOLIO'
                                  ? 'bg-[var(--accent-emerald-500)] text-black border-[var(--accent-emerald-500)] shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                  : 'bg-[var(--bg-overlay)] text-white border-[var(--line-soft)] shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                              }`}
                           >
                               <span className="relative z-10 uppercase">
                                   {ACTION_COPY[language][setupStage]}
                               </span>
                               <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12"></div>
                           </button>
                           <p className="text-center font-mono text-[9px] text-[var(--text-muted)] mt-2 animate-pulse uppercase tracking-widest">
                               [ STAGE_{setupStage === 'DISCLAIMER' ? '0' : setupStage === 'PORTFOLIO' ? '1' : '2'}/2 READY ]
                           </p>
                       </div>

                       <div className="absolute bottom-4 left-0 w-full px-6 flex justify-between items-center z-40 font-mono text-[10px] md:text-xs pointer-events-none">
                           <button onClick={() => setShowManifesto(true)} className="pointer-events-auto flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-ruby-500)] transition-colors group">
                               <span className="text-[var(--accent-ruby-500)] font-bold group-hover:animate-spin">*</span>
                               <span className="tracking-widest uppercase border-b border-transparent group-hover:border-[var(--accent-ruby-500)] transition-all">MANIFESTO</span>
                           </button>
                           <button onClick={() => setAppState('PORTFOLIO_VIEW')} className="pointer-events-auto flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-topaz-500)] transition-colors group">
                               <span className="text-[var(--accent-topaz-500)] font-bold group-hover:animate-bounce">⚓</span>
                               <span className="tracking-widest uppercase border-b border-transparent group-hover:border-[var(--accent-topaz-500)] transition-all">PORTFOLIO</span>
                           </button>
                       </div>
                  </div>
              )}

              {/* 2. SYSTEM WORKSPACE */}
              {appState === 'SYSTEM_WORKSPACE' && (
                  <CRTScreen title="INDRA_WORKSPACE.EXE" theme={theme} isActive={true}>
                      <SystemWorkspace 
                          cartridge={cartridge}
                          onUpdate={setCartridge}
                          theme={theme}
                          language={language}
                          onAdminGrant={() => {}}
                          onOpenCalendar={() => setShowCalendar(true)}
                      />
                  </CRTScreen>
              )}

              {/* 3. GAMEPLAY */}
              {appState === 'PLAYING' && (
                   <GameCanvas 
                      appState={appState}
                      difficulty="NORMAL"
                      speedModifier={1}
                      currentLevelIndex={currentLevelIndex}
                      viewMode="2D"
                      theme={theme}
                      onLevelComplete={handleLevelComplete}
                      onGameOver={handleLevelComplete}
                  />
              )}

              {/* 4. RECAP */}
              {appState === 'LEVEL_RECAP' && levelStats && (
                  <LevelRecap 
                      stats={levelStats}
                      onNextLevel={handleNextLevel}
                      onRetry={() => setAppState('PLAYING')}
                      onHome={() => setAppState('SETUP')}
                      isFinalLevel={currentLevelIndex === 2}
                      playerSpriteUrl={null}
                      villainSpriteUrl={null}
                      theme={theme}
                  />
              )}

          </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;


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
import { InsightCartridgeVisual } from './components/InsightCartridge';
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

// API KEY GATE (LANDING / HERO SCREEN)
const ApiKeyGate: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showArchive, setShowArchive] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Preload trends for later use
    useEffect(() => {
        const fetchTrends = async () => {
            if (process.env.API_KEY) {
                try {
                    await getTrendingAIKeywords();
                } catch (e) {
                    console.warn("Background fetch failed", e);
                }
            }
        };
        fetchTrends();
    }, []);

    const handleInsertKey = async () => {
        if (window.aistudio) {
            setIsLoading(true);
            try {
                await window.aistudio.openSelectKey();
                onComplete();
            } catch (e) {
                console.error("Key selection cancelled or failed", e);
                setIsLoading(false);
            }
        } else {
            onComplete();
        }
    };

    const renderCarouselContent = () => {
        switch (carouselIndex) {
            case 0: // RULES - LIST FORMAT
                return (
                    <div className="w-full flex flex-col gap-2 font-mono text-[10px] px-2 justify-center h-full">
                        <div className="flex gap-3 items-center">
                            <span className="text-[var(--accent-amethyst-500)] font-bold">01.</span>
                            <span className="text-[var(--text-secondary)]">DEFINE HERO + VILLAIN (INSIGHT)</span>
                        </div>
                        <div className="flex gap-3 items-center">
                            <span className="text-[var(--accent-amethyst-500)] font-bold">02.</span>
                            <span className="text-[var(--text-secondary)]">SELECT QUADRANT ANGLE</span>
                        </div>
                        <div className="flex gap-3 items-center">
                            <span className="text-[var(--accent-amethyst-500)] font-bold">03.</span>
                            <span className="text-[var(--text-secondary)]">AGENT BRAINSTORMS SYSTEM</span>
                        </div>
                    </div>
                );
            case 1: // PRICING - TABLE FORMAT
                return (
                    <div className="w-full flex flex-col gap-2 font-mono text-[10px] justify-center h-full px-1">
                         <div className="flex justify-between items-center border-b border-[var(--line-soft)] pb-1">
                             <span className="text-[var(--text-muted)] tracking-wider">TUTORIAL</span>
                             <span className="text-[var(--accent-emerald-500)] font-bold">10 CREDITS (FREE)</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-[var(--line-soft)] pb-1">
                             <span className="text-[var(--text-muted)] tracking-wider">ARCADE</span>
                             <span className="text-[var(--accent-topaz-500)] font-bold">€0.19 / TURN</span>
                         </div>
                         <div className="flex justify-between items-start">
                             <span className="text-[var(--text-muted)] tracking-wider shrink-0 mr-2">CO-OP WITH INDRA</span>
                             <span className="text-[var(--accent-ruby-500)] font-bold text-right">€50 / HR (BOOKING TIME IN CALENDAR)</span>
                         </div>
                    </div>
                );
            case 2: // SYSTEM - NOTIFICATION FORMAT
                return (
                    <div className="w-full flex flex-col items-center justify-center gap-2 font-mono text-[10px] h-full">
                        <div className="w-full border border-[var(--accent-topaz-500)]/30 bg-[var(--accent-topaz-500)]/10 p-2 rounded text-center">
                            <span className="text-[var(--accent-topaz-500)] tracking-widest font-bold">SAVE CODE = YOUR SYSTEM</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 w-full">
                            <span className="text-[var(--text-muted)] text-[9px] uppercase tracking-wide">Load anytime. No game over.</span>
                            <div className="w-full border-t border-[var(--line-soft)] pt-1 mt-1 text-center">
                                <span className="text-[var(--accent-amethyst-500)] animate-pulse tracking-tight">{">"} HUGGINGFACE DEPLOY SOON (YES, YOU CAN DEPLOY YOUR AI SYSTEMS ON HF)_</span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative h-dvh w-full flex flex-col overflow-hidden bg-[var(--bg-void)]">
            <Header />

            {showArchive && <SystemArchive onClose={() => setShowArchive(false)} />}

            {/* FULL VIEWPORT FRAME CONTAINER - NO SCROLL */}
            <div className="flex-1 relative w-full h-full overflow-hidden p-2 md:p-4">
                
                {/* DECORATIVE BORDER LAYER (GLOWING EDGE) */}
                <div className="absolute inset-0 md:inset-2 z-20 pointer-events-none border-[4px] md:border-[6px] border-[var(--accent-amethyst-500)] shadow-[0_0_30px_var(--accent-amethyst-500),inset_0_0_30px_rgba(157,78,221,0.3)] rounded-[2px]">
                     {/* Corner Accents - Cyberpunk Brackets */}
                     <div className="absolute top-[-2px] left-[-2px] w-8 h-8 md:w-16 md:h-16 border-t-[6px] border-l-[6px] border-[var(--accent-emerald-500)]"></div>
                     <div className="absolute top-[-2px] right-[-2px] w-8 h-8 md:w-16 md:h-16 border-t-[6px] border-r-[6px] border-[var(--accent-emerald-500)]"></div>
                     <div className="absolute bottom-[-2px] left-[-2px] w-8 h-8 md:w-16 md:h-16 border-b-[6px] border-l-[6px] border-[var(--accent-emerald-500)]"></div>
                     <div className="absolute bottom-[-2px] right-[-2px] w-8 h-8 md:w-16 md:h-16 border-b-[6px] border-r-[6px] border-[var(--accent-emerald-500)]"></div>
                     
                     {/* CRT Scanline Overlay */}
                     <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.1)50%)] bg-[length:100%_4px] opacity-20 z-10"></div>
                </div>

                {/* CONTENT LAYER (Flex Column to fit screen) */}
                <div className="w-full h-full relative z-10 flex flex-col items-center justify-between py-4 px-3 md:py-8 md:px-8">
                     
                     {/* 1. HERO TEXT SECTION - Compact */}
                     <div className="text-center shrink-0 mb-1 w-full max-w-full">
                         <p className="font-mono text-[10px] md:text-sm text-[var(--accent-sapphire-300)] tracking-[0.1em] uppercase mb-1 whitespace-nowrap overflow-visible">
                             YOUR INSIGHT IS DYING. LET'S MAKE IT REAL.
                         </p>
                         <h1 className="font-display text-7xl md:text-9xl lg:text-[10rem] tracking-tighter leading-none text-white drop-shadow-[0_0_25px_rgba(157,78,221,0.8)] animate-pulse mb-2 scale-y-110" style={{ textShadow: "0 0 10px var(--accent-amethyst-500)" }}>
                             INSERT MIND
                         </h1>
                     </div>

                     {/* 2. 4D SYSTEM ENGINE CARD - Flexible Height */}
                     <div className="flex-1 w-full max-w-xl min-h-0 flex flex-col justify-center my-2">
                        <div className="w-full h-full max-h-full border-2 border-[var(--accent-topaz-500)] bg-[rgba(245,158,11,0.03)] rounded relative overflow-hidden flex flex-col">
                            
                            {/* Card Header */}
                            <div className="bg-[rgba(245,158,11,0.1)] border-b border-[var(--accent-topaz-500)] p-2 text-center shrink-0">
                                <div className="font-mono text-[10px] md:text-sm text-[var(--accent-topaz-500)] tracking-widest drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis uppercase">
                                    ⚙️ ATTENTION: GAME SETUP
                                </div>
                            </div>
                            
                            {/* Card Content - Stacked Quadrant + Carousel */}
                            <div className="flex-1 flex flex-col min-h-0 relative">
                                
                                {/* QUADRANT VISUAL (Unified Grid) */}
                                <div className="flex-1 relative border-b border-[var(--line-soft)] bg-[var(--bg-void)]/80 shadow-inner overflow-hidden">
                                    
                                    {/* Crosshair Lines */}
                                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[var(--line-soft)] opacity-50"></div>
                                    <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[var(--line-soft)] opacity-50"></div>
                                    
                                    {/* Labels Positioned in Corners (Unified Mono Font) */}
                                    <div className="absolute top-2 left-3">
                                        <span className="font-mono text-[10px] md:text-xs text-[var(--accent-amethyst-500)] tracking-widest opacity-90 drop-shadow-sm">STRATEGY</span>
                                    </div>
                                    <div className="absolute top-2 right-3 text-right">
                                        <span className="font-mono text-[10px] md:text-xs text-[var(--accent-emerald-500)] tracking-widest opacity-90 drop-shadow-sm">CREATIVE</span>
                                    </div>
                                    <div className="absolute bottom-2 left-3">
                                        <span className="font-mono text-[10px] md:text-xs text-[var(--accent-sapphire-500)] tracking-widest opacity-90 drop-shadow-sm">PRODUCING</span>
                                    </div>
                                    <div className="absolute bottom-2 right-3 text-right">
                                        <span className="font-mono text-[10px] md:text-xs text-[var(--accent-ruby-500)] tracking-widest opacity-90 drop-shadow-sm">MEDIA</span>
                                    </div>
                                    
                                    {/* The "Insight" Point - CENTERED */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center pointer-events-none">
                                        <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse"></div>
                                        <div className="absolute w-12 h-12 md:w-16 md:h-16 border border-white/30 rounded-full animate-ping"></div>
                                        <div className="absolute w-24 h-24 md:w-32 md:h-32 border border-white/10 rounded-full animate-ping delay-100"></div>
                                    </div>
                                </div>

                                {/* CAROUSEL SECTION (Fixed Height) */}
                                <div className="shrink-0 bg-[var(--bg-void)]/60 p-2 md:p-3 flex flex-col gap-1 border-t border-[var(--line-soft)] h-[110px] md:h-[130px]">
                                    
                                    {/* Dots Controls */}
                                    <div className="flex justify-center gap-2 mb-1">
                                        {[0, 1, 2].map(idx => (
                                            <button 
                                                key={idx}
                                                onClick={() => setCarouselIndex(idx)}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${carouselIndex === idx ? 'bg-[var(--accent-topaz-500)] scale-125 shadow-[0_0_8px_var(--accent-topaz-500)]' : 'bg-[var(--line-soft)] hover:bg-[var(--text-muted)]'}`}
                                                aria-label={`Show info slide ${idx + 1}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Carousel Content */}
                                    <div className="flex-1 flex items-center justify-center px-2">
                                        {renderCarouselContent()}
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* 3. ACTION BUTTON - Anchored Bottom */}
                     <div className="w-full max-w-md z-30 shrink-0 mt-2 mb-2">
                         <button 
                            onClick={handleInsertKey} 
                            disabled={isLoading}
                            className="w-full py-4 md:py-5 bg-[var(--accent-amethyst-500)] text-[var(--text-inverse)] font-display font-bold text-3xl md:text-4xl rounded shadow-[0_0_30px_rgba(157,78,221,0.5)] hover:bg-[var(--accent-amethyst-700)] hover:scale-[1.02] transition-all active:scale-95 border border-[var(--border-glow)] tracking-widest relative overflow-hidden group"
                         >
                             <span className="relative z-10 group-hover:text-white transition-colors">
                                 {isLoading ? "INITIALIZING..." : "INSERT MIND (FREE TRIAL)"}
                             </span>
                             {/* Button Shine Effect */}
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
            </div>
        </div>
    );
};

// Extracted Sprite Lab Controls
const SpriteLabControls: React.FC<{
    targetSpriteType: SpriteType;
    workState: WorkState;
    activeSprite: string | null;
    library: GameSprite[];
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onLibrarySelect: (s: GameSprite) => void;
    onDiscard: () => void;
    onRefine: (prompt: string) => void;
    isDragging: boolean;
    dragHandlers: {
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
        onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
        onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    };
    fileInputRef: React.RefObject<HTMLInputElement | null>; 
    appState: AppState;
    isSetupComplete: boolean;
}> = ({
    targetSpriteType, workState, activeSprite, library,
    onFileSelect, onLibrarySelect, onDiscard, onRefine,
    isDragging, dragHandlers, fileInputRef, appState, isSetupComplete
}) => {
    const activeDragColor = 'border-[var(--accent-emerald-500)] bg-[var(--accent-emerald-500)]/10';
    const textColor = targetSpriteType === 'PLAYER' ? 'text-[var(--accent-amethyst-500)]' : 'text-[var(--accent-ruby-500)]';

    const refineInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col h-full gap-2">
            {/* UPLOAD AREA */}
            {!workState.source && !workState.generated && (
                <div
                    className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed transition-all text-center cursor-pointer relative group rounded-lg p-2 ${isDragging ? activeDragColor : `border-[var(--line-soft)] hover:bg-[var(--bg-surface)]`} ${appState !== 'SETUP' ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => appState === 'SETUP' && fileInputRef.current?.click()}
                    {...dragHandlers}
                >
                    <div className={`text-3xl mb-1 ${targetSpriteType === 'PLAYER' ? 'text-[var(--accent-emerald-500)]' : 'text-[var(--accent-ruby-500)]'}`}>
                         {targetSpriteType === 'PLAYER' ? '🛡️' : '⚔️'}
                    </div>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider">UPLOAD PHOTO</p>
                </div>
            )}

            {/* PROCESSING / SOURCE PREVIEW */}
            {(workState.source || workState.generated) && (
                <div className="flex-1 relative border border-[var(--border-soft)] bg-black p-1 rounded-lg overflow-hidden flex items-center justify-center">
                    {workState.source && !workState.generated && (
                        <>
                            <div className="absolute top-0 left-0 bg-[var(--accent-ruby-500)] text-white text-[9px] px-1 py-0.5 font-mono rounded-br z-10">SOURCE</div>
                            <img src={workState.source.url} alt="Source" className={`object-contain max-h-full max-w-full ${workState.status === 'PROCESSING_SPRITE' ? 'animate-pulse opacity-90' : 'opacity-100'}`} />
                        </>
                    )}
                </div>
            )}

             {/* CONTROLS (Retry/Cancel) */}
             {!workState.generated && (
                 <div className="shrink-0">
                    {workState.status === 'PROCESSING_SPRITE' && (
                        <div className="w-full border rounded p-1 text-center font-mono text-[10px] animate-pulse border-[var(--accent-amethyst-500)] bg-[var(--accent-amethyst-500)]/10 text-[var(--accent-amethyst-500)]">DIGITIZING...</div>
                    )}
                    {workState.status === 'ERROR' && (
                        <RetroButton variant="secondary" className="w-full !text-xs !py-1 !border-[var(--accent-ruby-500)] !text-[var(--accent-ruby-500)] hover:!bg-[var(--accent-ruby-500)]/10" onClick={() => appState === 'SETUP' && fileInputRef.current?.click()}>RETRY</RetroButton>
                    )}
                    {workState.source && (
                        <button onClick={onDiscard} className="text-[10px] underline font-mono mt-1 w-full text-center text-[var(--text-muted)] hover:text-white">CANCEL</button>
                    )}
                 </div>
             )}

            {/* EDIT/REFINE (Flash Image Feature) */}
            {activeSprite && appState === 'SETUP' && (
                <div className="flex flex-col gap-1 p-1 border border-dashed rounded border-[var(--accent-amethyst-500)]/30 bg-[var(--accent-amethyst-500)]/5">
                    <label className="text-[9px] font-mono tracking-widest text-[var(--text-muted)]">NANO BANANA // EDIT</label>
                    <div className="flex gap-1">
                        <input 
                            ref={refineInputRef}
                            type="text" 
                            placeholder="Add sunglasses..."
                            className="flex-1 bg-transparent border-b p-0.5 text-[10px] font-mono focus:outline-none border-[var(--accent-amethyst-500)]/50 text-[var(--accent-amethyst-500)] placeholder-[var(--text-muted)]"
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    onRefine(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                        <button 
                            onClick={() => {
                                if (refineInputRef.current?.value.trim()) {
                                    onRefine(refineInputRef.current.value);
                                    refineInputRef.current.value = '';
                                }
                            }}
                            className="text-[9px] px-1 border rounded border-[var(--accent-amethyst-500)] hover:bg-[var(--accent-amethyst-500)]/20 text-[var(--accent-amethyst-500)] font-mono"
                        >
                            GO
                        </button>
                    </div>
                </div>
            )}

             {/* Hidden File Input */}
             <input type="file" ref={fileInputRef as any} onChange={onFileSelect} accept="image/*" className="hidden" />
        </div>
    );
};


// --- TOUCH CONTROLS COMPONENT ---
const TouchControls: React.FC<{ viewMode: '2D' | '3D', onToggleView: () => void }> = ({ viewMode, onToggleView }) => {
    const handlePress = (key: string) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: key, bubbles: true }));
        if (navigator.vibrate) navigator.vibrate(10);
    };
    
    const handleRelease = (key: string) => {
        window.dispatchEvent(new KeyboardEvent('keyup', { key: key, bubbles: true }));
    }

    return (
      <div className="absolute bottom-4 left-0 w-full px-6 pb-4 z-[100] flex justify-between items-end pointer-events-none lg:hidden">
          {/* D-PAD LEFT */}
          <div className="pointer-events-auto select-none touch-none">
              <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <button 
                    onPointerDown={(e) => { e.preventDefault(); handlePress('ArrowUp'); }} 
                    onPointerUp={(e) => { e.preventDefault(); handleRelease('ArrowUp'); }}
                    onPointerLeave={(e) => { e.preventDefault(); handleRelease('ArrowUp'); }}
                    className="w-16 h-16 rounded-t-lg flex items-center justify-center touch-btn"
                  >▲</button>
                  <div></div>
                  
                  <button onPointerDown={(e) => { e.preventDefault(); handlePress('ArrowLeft'); }} className="w-16 h-16 rounded-l-lg flex items-center justify-center touch-btn">◀</button>
                  <div className="w-16 h-16"></div>
                  <button onPointerDown={(e) => { e.preventDefault(); handlePress('ArrowRight'); }} className="w-16 h-16 rounded-r-lg flex items-center justify-center touch-btn">▶</button>
                  
                  <div></div>
                  {viewMode === '2D' ? (
                      <button onPointerDown={(e) => { e.preventDefault(); handlePress('ArrowDown'); }} className="w-16 h-16 rounded-b-lg flex items-center justify-center touch-btn">▼</button>
                  ) : (
                      <div className="w-16 h-16"></div>
                  )}
                  <div></div>
              </div>
          </div>

          {/* ACTION RIGHT */}
           <div className="pointer-events-auto flex flex-col gap-4 select-none touch-none">
              <button onPointerDown={(e) => { e.preventDefault(); onToggleView(); }} className="w-20 h-20 rounded-full flex items-center justify-center touch-btn border-2 border-[var(--accent-topaz-500)] text-[var(--accent-topaz-500)] hover:bg-[var(--accent-topaz-500)]/20 shadow-[var(--shadow-glow-amethyst)]">
                  <span className="font-display text-xl font-bold">{viewMode}</span>
              </button>
           </div>
      </div>
    );
};

// --- INTRO ANIMATION COMPONENT ---
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

type AppState = 'SETUP' | 'BATTLE_PREVIEW' | 'PLAYING' | 'RECAP' | 'VICTORY';

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
  const [isPaused, setIsPaused] = useState(false);
  
  const [hasCheckedKey, setHasCheckedKey] = useState(false);
  const [hasValidKey, setHasValidKey] = useState(false);
  
  const [heroWork, setHeroWork] = useState<WorkState>(initialWorkState);
  const [villainWork, setVillainWork] = useState<WorkState>(initialWorkState);

  const [targetSpriteType, setTargetSpriteType] = useState<SpriteType>('PLAYER');
  const [isDragging, setIsDragging] = useState(false);
  const [globalStatus, setGlobalStatus] = useState<string>("AWAITING INPUT...");

  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [villainSpeedMod, setVillainSpeedMod] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');

  const [activePlayerSprite, setActivePlayerSprite] = useState<string | null>(null);
  const [activeVillainSprite, setActiveVillainSprite] = useState<string | null>(null);
  const [insertFlash, setInsertFlash] = useState(false);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [lastLevelStats, setLastLevelStats] = useState<LevelStats | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const [battleImageUrl, setBattleImageUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [isGeneratingBattle, setIsGeneratingBattle] = useState(false);
  const [isGameLaunchRequested, setIsGameLaunchRequested] = useState(false);

  const [currentTip, setCurrentTip] = useState(0);
  const [dynamicTips, setDynamicTips] = useState<string[]>(["DON'T GET CAUGHT!"]);
  const [spriteLibrary, setSpriteLibrary] = useState<GameSprite[]>([]);
  
  // INSIGHT CARTRIDGE STATE
  const [cartridge, setCartridge] = useState<InsightCartridge>(createEmptyCartridge());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSetupComplete = activePlayerSprite !== null && activeVillainSprite !== null;
  const currentWork = targetSpriteType === 'PLAYER' ? heroWork : villainWork;
  
  const { theme, toggleTheme } = useTheme();

  // API Key Check on Mount
  useEffect(() => {
    const checkKey = async () => {
        if (window.aistudio) {
            const has = await window.aistudio.hasSelectedApiKey();
            setHasValidKey(has);
        } else {
            setHasValidKey(true); // Dev/Standalone fallback
        }
        setHasCheckedKey(true);
    };
    checkKey();
  }, []);

  const checkApiKeyError = useCallback(async (e: any) => {
    const msg = e?.toString() || e?.message || "";
    if (msg.includes("Requested entity was not found") || msg.includes("404")) {
        setHasValidKey(false);
    }
  }, []);

  const setSpriteWork = (type: SpriteType, update: React.SetStateAction<WorkState>) => {
      if (type === 'PLAYER') setHeroWork(update);
      else setVillainWork(update);
  };

  const handleInteraction = () => {
      initAudio();
  };

  const handleGenerateSprite = async (file: File, typeToGen: SpriteType) => {
    handleInteraction();
    if (!file.type.startsWith('image/')) {
       setGlobalStatus("ERROR: INVALID FILE TYPE.");
       return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64DataStr = e.target?.result as string;
        const sourceImg: UploadedImage = {
            data: base64DataStr.split(',')[1],
            mimeType: file.type,
            url: URL.createObjectURL(file),
        };

        setSpriteWork(typeToGen, prev => ({ ...prev, source: sourceImg, generated: null, status: 'PROCESSING_SPRITE', progressTick: 0 }));
        if (typeToGen === targetSpriteType) setGlobalStatus("INITIALIZING PROTOCOL...");

        const start = Date.now();
        const timer = setInterval(() => {
            setSpriteWork(typeToGen, prev => ({ ...prev, progressTick: Math.floor((Date.now() - start) / 1000) }));
        }, 1000);

        try {
            const result = await generateArcadeSprite(sourceImg.data, sourceImg.mimeType, typeToGen);
            setGlobalStatus("EXECUTING FLOOD-FILL BACKGROUND REMOVAL...");
            
            clearInterval(timer);
            setInsertFlash(true);
            setTimeout(() => setInsertFlash(false), 200);
            setBattleImageUrl(null);

            const newUrl = `data:${result.mimeType};base64,${result.data}`;
            setSpriteLibrary(prev => [ ...prev, { id: Date.now().toString(), type: typeToGen, imageUrl: newUrl } ]);

            if (typeToGen === 'PLAYER') {
                setActivePlayerSprite(newUrl);
                setHeroWork(initialWorkState); 
                setCartridge(prev => ({ ...prev, hero: { ...prev.hero, photo: newUrl } }));
                if (!activeVillainSprite) {
                    setTargetSpriteType('VILLAIN');
                }
            } else {
                setActiveVillainSprite(newUrl);
                setVillainWork(initialWorkState); 
                setCartridge(prev => ({ ...prev, villain: { ...prev.villain, photo: newUrl } }));
                if (!activePlayerSprite) {
                    setTargetSpriteType('PLAYER');
                }
            }
            
        } catch (error) {
            clearInterval(timer);
            console.error(error);
            checkApiKeyError(error);
            setSpriteWork(typeToGen, prev => ({ ...prev, status: 'ERROR' }));
        }
    };
    reader.readAsDataURL(file);
  };

  const handleRefineSprite = async (prompt: string) => {
      handleInteraction();
      const currentSprite = targetSpriteType === 'PLAYER' ? activePlayerSprite : activeVillainSprite;
      if (!currentSprite) return;

      setGlobalStatus(`REFINING ${targetSpriteType}...`);
      setSpriteWork(targetSpriteType, prev => ({ ...prev, status: 'PROCESSING_SPRITE' }));

      try {
          const base64 = currentSprite.split(',')[1];
          const result = await editArcadeSprite(base64, 'image/png', prompt);
          const processedUrl = `data:${result.mimeType};base64,${result.data}`;

          setInsertFlash(true);
          setTimeout(() => setInsertFlash(false), 200);
          setBattleImageUrl(null);

          if (targetSpriteType === 'PLAYER') {
              setActivePlayerSprite(processedUrl);
              setHeroWork(initialWorkState);
          } else {
              setActiveVillainSprite(processedUrl);
              setVillainWork(initialWorkState);
          }
          setGlobalStatus(`${targetSpriteType} REFINED.`);
          setSpriteLibrary(prev => [ ...prev, { id: Date.now().toString(), type: targetSpriteType, imageUrl: processedUrl } ]);

      } catch (e) {
          console.error("Refine failed", e);
          setSpriteWork(targetSpriteType, prev => ({ ...prev, status: 'IDLE' }));
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleGenerateSprite(file, targetSpriteType);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleGenerateSprite(file, targetSpriteType);
  };

  const handleDiscard = () => {
      if (targetSpriteType === 'PLAYER' && heroWork.source?.url) URL.revokeObjectURL(heroWork.source.url);
      if (targetSpriteType === 'VILLAIN' && villainWork.source?.url) URL.revokeObjectURL(villainWork.source.url);
      setSpriteWork(targetSpriteType, initialWorkState);
  }

  const handleSelectFromLibrary = (sprite: GameSprite) => {
      handleInteraction();
      setInsertFlash(true);
      setTimeout(() => setInsertFlash(false), 200);
      setBattleImageUrl(null);

      if (sprite.type === 'PLAYER') {
          setActivePlayerSprite(sprite.imageUrl);
      } else {
          setActiveVillainSprite(sprite.imageUrl);
      }
  };

  const startGame = async (mode: '2D' | '3D') => {
      handleInteraction();
      if (!isSetupComplete) return;

      setIsGameLaunchRequested(true);
      setViewMode(mode);
      setIsPaused(false);
      
      if (mode === '2D') {
          setDifficulty('EASY');
          setVillainSpeedMod(0.9);
      } else {
          setDifficulty('HARD');
          setVillainSpeedMod(1.1);
      }

      if (battleImageUrl) return;

      if (isGeneratingBattle) {
          return;
      }

      setIsGeneratingBattle(true);
      setGlobalStatus("GENERATING BATTLE SCENE...");
      
      try {
           // Battle generation logic
      } catch (e) {
          console.error("Battle generation failed, falling back.", e);
          checkApiKeyError(e);
          setCountdown(5);
          setAppState('BATTLE_PREVIEW');
      } finally {
          setIsGeneratingBattle(false);
      }
  };

  useEffect(() => {
      if (appState === 'SETUP' && isGameLaunchRequested && battleImageUrl) {
          setCountdown(5);
          setAppState('BATTLE_PREVIEW');
          setGlobalStatus("GET READY!");
      }
  }, [appState, isGameLaunchRequested, battleImageUrl]);


  const handleStartMatch = useCallback(() => {
      handleInteraction();
      playGoSignal();
      setCurrentLevelIdx(0);
      setAppState('PLAYING');
      setIsPaused(false);
  }, []);

  useEffect(() => {
      if (appState === 'BATTLE_PREVIEW') {
          if (countdown > 0) {
              playCountdownBeep();
              const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
              return () => clearTimeout(timer);
          } else {
              handleStartMatch();
          }
      }
  }, [appState, countdown, handleStartMatch]);

  const handleLevelComplete = useCallback((stats: LevelStats) => {
      setLastLevelStats(stats);
      setAppState('RECAP');
  }, []);

  const handleGameOver = useCallback((stats: LevelStats) => {
      setLastLevelStats(stats);
      setAppState('RECAP');
  }, []);

  const handleNextLevel = useCallback(() => {
      handleInteraction();
      setCurrentLevelIdx(prev => {
          if (prev >= 2) {
               setAppState('VICTORY');
               return prev;
          }
          setAppState('PLAYING');
          setIsPaused(false);
          return prev + 1;
      });
  }, []);

  const handleRetryLevel = useCallback(() => {
      handleInteraction();
      setRetryKey(k => k + 1);
      setAppState('PLAYING');
      setIsPaused(false);
  }, []);

  const resetToTitle = useCallback(() => {
      handleInteraction();
      setAppState('SETUP');
      setCurrentLevelIdx(0);
      setBattleImageUrl(null);
      setIsGameLaunchRequested(false);
      setIsPaused(false);
  }, []);

  const handleIntroImpact = useCallback(() => setUiVisible(true), []);
  const handleIntroComplete = useCallback(() => setShowIntro(false), []);

  const filteredLibrary = spriteLibrary.filter(s => s.type === targetSpriteType);

  // Initial Loading State for Key Check
  if (!hasCheckedKey) {
      return <div className="h-full w-full bg-[var(--bg-void)]"></div>;
  }

  // Gate: Insert Coin / Select Key
  if (!hasValidKey) {
      return (
          <ApiKeyGate 
              onComplete={() => setHasValidKey(true)} 
          />
      );
  }

  const SpritePreview: React.FC<{ src: string; className?: string; alt?: string }> = ({ src, className = '', alt }) => {
      return (
          <div className={`relative overflow-hidden ${className}`} role="img" aria-label={alt}>
             <img src={src} className="w-full h-full object-contain" alt={alt} />
          </div>
      );
  };

  return (
    <div className="relative h-dvh overflow-hidden font-body transition-colors duration-300 bg-[var(--bg-void)] text-[var(--text-primary)]" onClick={handleInteraction}>
      
      {/* HEADER (ALWAYS VISIBLE) */}
      <Header />

      {/* Intro Overlay */}
      {showIntro && <IntroAnimation onImpact={handleIntroImpact} onComplete={handleIntroComplete} />}

      {/* MAIN APP CONTENT */}
      <div className={`relative z-0 h-[calc(100vh-3.5rem)] transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${uiVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0 blur-3xl'}`}>

        {appState === 'SETUP' ? (
             <main className="h-full grid grid-rows-[auto_1fr_auto] gap-0 p-0 overflow-hidden">
                 {/* Top: Heading */}
                 <div className="px-4 py-2 border-b border-[var(--line-soft)] flex flex-col items-center justify-center">
                     <h2 className="font-[var(--font-display)] text-[var(--text-primary)] text-xl tracking-wide">
                         INITIALIZE CARTRIDGE
                     </h2>
                     <p className="font-[var(--font-body)] text-xs text-[var(--text-secondary)]">
                         Systematize your insight into AI Agents
                     </p>
                 </div>

                 {/* Middle: Hero/Villain Cards */}
                 <div className="grid grid-cols-2 gap-4 px-4 py-4 min-h-0 overflow-hidden h-full">
                     {/* HERO SLOT */}
                     <div 
                        className={`border-2 rounded-lg p-3 flex flex-col h-full cursor-pointer hover:bg-[var(--bg-surface)] transition-colors ${targetSpriteType === 'PLAYER' ? 'border-[var(--accent-emerald-500)] bg-[var(--accent-emerald-500)]/5' : 'border-[var(--line-soft)]'}`}
                        onClick={() => setTargetSpriteType('PLAYER')}
                     >
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-xl font-[var(--font-display)] text-[var(--accent-topaz-500)]">01.</span>
                            <span className="text-xl">🛡️</span>
                         </div>
                         <h3 className="font-[var(--font-display)] text-base text-[var(--accent-emerald-500)] leading-none mb-0.5">CREATE HERO</h3>
                         <p className="font-[var(--font-mono)] text-[10px] text-[var(--text-muted)] mb-2">DRIVER / MOTIVE</p>
                         
                         <div className="flex-1 relative overflow-hidden flex flex-col justify-center min-h-0">
                             {activePlayerSprite ? (
                                 <img src={activePlayerSprite} className="object-contain max-h-full mx-auto" alt="Hero" />
                             ) : (
                                <div className="h-full w-full border border-dashed border-[var(--line-soft)] rounded flex items-center justify-center text-[var(--text-muted)]">
                                     <span className="text-[10px] font-mono">UPLOAD</span>
                                </div>
                             )}
                         </div>

                         {targetSpriteType === 'PLAYER' && !activePlayerSprite && (
                            <div className="mt-2 h-1/3 min-h-[80px]">
                                <SpriteLabControls 
                                    targetSpriteType="PLAYER"
                                    workState={heroWork}
                                    activeSprite={activePlayerSprite}
                                    library={filteredLibrary}
                                    onFileSelect={handleFileChange}
                                    onLibrarySelect={handleSelectFromLibrary}
                                    onDiscard={handleDiscard}
                                    onRefine={handleRefineSprite}
                                    isDragging={isDragging}
                                    dragHandlers={{ onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop }}
                                    fileInputRef={fileInputRef}
                                    appState={appState}
                                    isSetupComplete={isSetupComplete}
                                />
                            </div>
                         )}
                     </div>

                     {/* VILLAIN SLOT */}
                     <div 
                        className={`border-2 rounded-lg p-3 flex flex-col h-full cursor-pointer hover:bg-[var(--bg-surface)] transition-colors ${targetSpriteType === 'VILLAIN' ? 'border-[var(--accent-ruby-500)] bg-[var(--accent-ruby-500)]/5' : 'border-[var(--line-soft)]'}`}
                        onClick={() => setTargetSpriteType('VILLAIN')}
                     >
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-xl font-[var(--font-display)] text-[var(--accent-topaz-500)]">02.</span>
                            <span className="text-xl">⚔️</span>
                         </div>
                         <h3 className="font-[var(--font-display)] text-base text-[var(--accent-ruby-500)] leading-none mb-0.5">CREATE VILLAIN</h3>
                         <p className="font-[var(--font-mono)] text-[10px] text-[var(--text-muted)] mb-2">BARRIER / OBSTACLE</p>
                         
                         <div className="flex-1 relative overflow-hidden flex flex-col justify-center min-h-0">
                             {activeVillainSprite ? (
                                 <img src={activeVillainSprite} className="object-contain max-h-full mx-auto" alt="Villain" />
                             ) : (
                                <div className="h-full w-full border border-dashed border-[var(--line-soft)] rounded flex items-center justify-center text-[var(--text-muted)]">
                                     <span className="text-[10px] font-mono">UPLOAD</span>
                                </div>
                             )}
                         </div>

                         {targetSpriteType === 'VILLAIN' && !activeVillainSprite && (
                             <div className="mt-2 h-1/3 min-h-[80px]">
                                 <SpriteLabControls 
                                    targetSpriteType="VILLAIN"
                                    workState={villainWork}
                                    activeSprite={activeVillainSprite}
                                    library={filteredLibrary}
                                    onFileSelect={handleFileChange}
                                    onLibrarySelect={handleSelectFromLibrary}
                                    onDiscard={handleDiscard}
                                    onRefine={handleRefineSprite}
                                    isDragging={isDragging}
                                    dragHandlers={{ onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop }}
                                    fileInputRef={fileInputRef}
                                    appState={appState}
                                    isSetupComplete={isSetupComplete}
                                 />
                             </div>
                         )}
                     </div>
                 </div>

                 {/* Bottom: CTA Buttons */}
                 <div className="px-4 py-3 border-t border-[var(--line-soft)] flex gap-4 bg-[var(--bg-void)]">
                     <button 
                        disabled={!isSetupComplete}
                        onClick={() => startGame('2D')}
                        className={`flex-1 py-3 font-[var(--font-display)] text-lg rounded border transition-all ${isSetupComplete ? 'bg-[var(--accent-amethyst-500)] text-white border-[var(--accent-amethyst-500)] hover:brightness-110' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--line-soft)]'}`}
                     >
                         START 2D
                     </button>
                     <button 
                        disabled={!isSetupComplete}
                        onClick={() => startGame('3D')}
                        className={`flex-1 py-3 font-[var(--font-display)] text-lg rounded border transition-all ${isSetupComplete ? 'bg-[var(--accent-sapphire-500)] text-white border-[var(--accent-sapphire-500)] hover:brightness-110' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--line-soft)]'}`}
                     >
                         START 3D
                     </button>
                 </div>
             </main>
        ) : (
            // GAMEPLAY / CANVAS AREA
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-4 lg:gap-8 min-h-0 p-4">
                {/* LEFT: Game Cabinet */}
                <div className={`flex flex-col order-2 lg:order-1 h-full min-h-0 relative col-span-1 lg:col-span-8`}>
                    <CRTScreen title="GAME_CABINET_01" isActive={true} className="h-full flex-1" theme={theme === 'dark' ? 'DARK' : 'LIGHT'}>
                         <div className={`absolute top-4 left-4 right-4 z-0 transition-all duration-300 bottom-4`}>
                            <GameCanvas
                                key={retryKey}
                                appState={appState}
                                playerSpriteUrl={activePlayerSprite}
                                villainSpriteUrl={activeVillainSprite}
                                difficulty={difficulty}
                                speedModifier={villainSpeedMod}
                                currentLevelIndex={currentLevelIdx}
                                viewMode={viewMode}
                                onLevelComplete={handleLevelComplete}
                                onGameOver={handleGameOver}
                                theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                                isPaused={isPaused}
                            />
                        </div>
                        {/* Overlays (Pause, Recap, Victory, etc.) are handled inside GameCanvas or here if needed */}
                        {appState === 'RECAP' && lastLevelStats && (
                            <LevelRecap
                                stats={lastLevelStats}
                                onNextLevel={lastLevelStats.isWin && currentLevelIdx < 2 ? handleNextLevel : resetToTitle}
                                onRetry={handleRetryLevel}
                                onHome={resetToTitle}
                                isFinalLevel={currentLevelIdx >= 2}
                                playerSpriteUrl={activePlayerSprite}
                                villainSpriteUrl={activeVillainSprite}
                                theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                                onAuthError={checkApiKeyError}
                            />
                        )}
                    </CRTScreen>
                </div>
                
                {/* RIGHT: Agent/Joystick Feedback (Desktop) */}
                <div className={`flex-col gap-2 md:gap-4 order-1 lg:order-2 h-[40vh] lg:h-full min-h-0 lg:col-span-4 hidden lg:flex`}>
                     <CRTScreen title="SYSTEM_LOG" isActive={true} className="h-full" theme={theme === 'dark' ? 'DARK' : 'LIGHT'}>
                         <div className="p-4 font-mono text-xs space-y-2">
                             <div className="text-[var(--accent-emerald-500)]">{">"} HERO ENERGY: {cartridge.hero.energy}%</div>
                             <div className="text-[var(--accent-ruby-500)]">{">"} VILLAIN ENERGY: {cartridge.villain.energy}%</div>
                             <div className="text-[var(--accent-amethyst-500)]">{">"} TENSION: {cartridge.tension}%</div>
                             <br/>
                             <div className="text-[var(--text-secondary)]">
                                 AGENT: "Keep moving. The system builds itself as you resolve the conflict."
                             </div>
                         </div>
                     </CRTScreen>
                </div>
            </main>
        )}
      </div>
    </div>
  );
};

export default App;

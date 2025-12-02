
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { InsightCartridge, updateCartridgeProgress } from '../lib/insight-object';
import { chatWithManagerAgent, systematizeInsight } from '../services/gemini';
import { generatePythonAgent, generateReadme, triggerDownload } from '../lib/system-serializer';
import { loginWithGoogle, logout, saveWorkspace, deductCredit, UserProfile, subscribeToAuth } from '../services/auth-service';
import RetroButton from './RetroButton';
import { User } from 'firebase/auth';

interface Props {
    cartridge: InsightCartridge;
    onUpdate: (cartridge: InsightCartridge) => void;
    theme: 'DARK' | 'LIGHT';
}

const SystemWorkspace: React.FC<Props> = ({ cartridge, onUpdate, theme }) => {
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isSystematizing, setIsSystematizing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
    
    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Derived State
    const isNameUndefined = !cartridge.userName || cartridge.userName === "UNDEFINED";
    const isSetupPhase = !cartridge.hero.description || !cartridge.villain.description;
    const isLowCredits = (userProfile?.credits || cartridge.credits) < 1;

    // Listen to Auth
    useEffect(() => {
        const unsubscribe = subscribeToAuth(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // In a real app, we would fetch the full profile here again
                // For MVP, we rely on the login return or optimistic updates
            }
        });
        return () => unsubscribe();
    }, []);

    // Initial Greeting
    useEffect(() => {
        if (cartridge.chatHistory.length === 0) {
            handleSend("SYSTEM_START"); 
        }
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [cartridge.chatHistory]);

    // Save on Update
    useEffect(() => {
        if (user) {
            saveWorkspace(user.uid, cartridge);
        }
    }, [cartridge, user]);

    // Automatic Deep Systematization Trigger
    useEffect(() => {
        if (!isSetupPhase && !isSystematizing && cartridge.quadrants.strategy.level === 0) {
            handleSystematization();
        }
    }, [isSetupPhase]);

    const handleLogin = async () => {
        const profile = await loginWithGoogle();
        if (profile) {
            setUserProfile(profile);
            setShowLoginModal(false);
            // Sync credits from DB to Cartridge
            onUpdate({ ...cartridge, credits: profile.credits });
        }
    };

    const handleSystematization = async () => {
        setIsSystematizing(true);
        setActiveQuadrant('ALL');

        try {
            const systemUpdates = await systematizeInsight(cartridge);
            const nextState = updateCartridgeProgress(cartridge, {
                ...systemUpdates,
                chatHistory: [...cartridge.chatHistory, { 
                    role: 'system', 
                    content: "⚡ SYSTEMATIZATION COMPLETE. 4-DIMENSIONAL STRATEGY GENERATED." 
                }]
            });
            onUpdate(nextState);
        } catch (e) {
            console.error("Systematization error", e);
        } finally {
            setIsSystematizing(false);
            setActiveQuadrant(null);
        }
    };

    const handleEnterArcade = () => {
        const nextState = updateCartridgeProgress(cartridge, { status: 'GAMEPLAY' });
        onUpdate(nextState);
    };

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isThinking) return; 

        const isSystemTrigger = textToSend === "SYSTEM_START";
        
        // CHECK CREDITS (If not system trigger)
        if (!isSystemTrigger) {
            if (cartridge.credits < 1) {
                setShowLoginModal(true);
                return;
            }
        }

        if (!isSystemTrigger) setInput('');
        setIsThinking(true);
        
        // DEDUCT CREDIT (Optimistic)
        const newCredits = isSystemTrigger ? cartridge.credits : Math.max(0, cartridge.credits - 1.0);
        
        // If logged in, deduct from Firestore
        if (user && !isSystemTrigger) {
            deductCredit(user.uid);
        }

        let newHistory = [...cartridge.chatHistory];
        if (!isSystemTrigger) {
            newHistory.push({ role: 'user' as const, content: textToSend });
        }
        
        // 1. Optimistic update
        const tempState = updateCartridgeProgress(cartridge, { 
            chatHistory: newHistory, 
            credits: newCredits 
        });
        onUpdate(tempState);

        try {
            // 2. Call Gemini (Ambika)
            const result = await chatWithManagerAgent(isSystemTrigger ? "Initialize Ambika." : textToSend, tempState);
            
            // 3. Deep merge the updates
            const nextState = updateCartridgeProgress(tempState, {
                ...result.updatedCartridge,
                chatHistory: [...newHistory, { role: 'model', content: result.text }]
            });
            
            onUpdate(nextState);
            
        } catch (e) {
            console.error(e);
            const errorState = updateCartridgeProgress(tempState, {
                 chatHistory: [...newHistory, { role: 'system' as const, content: "AMBIKA CONNECTION ERROR. PLEASE RETRY." }]
            });
            onUpdate(errorState);
        } finally {
            setIsThinking(false);
        }
    };

    const handleExport = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        const code = generatePythonAgent(cartridge);
        const readme = generateReadme(cartridge);
        triggerDownload(`indra_agent_${cartridge.id.slice(0,4)}.py`, code);
        triggerDownload(`README.md`, readme);
    };

    const isQActive = (q: string) => activeQuadrant === q || activeQuadrant === 'ALL';

    return (
        <div className="h-full w-full flex flex-col md:flex-row gap-4 relative">
            
            {/* LOGIN MODAL (PAYWALL/AUTH) */}
            {showLoginModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-void)]/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="cartridge-slot p-8 max-w-md w-full text-center border-[var(--accent-topaz-500)] shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                        <h2 className="font-display text-4xl text-[var(--text-primary)] mb-2">ACCESS REQUIRED</h2>
                        <p className="font-mono text-xs text-[var(--accent-ruby-500)] mb-6 tracking-widest">
                            {isLowCredits ? "INSUFFICIENT COMPUTING CREDITS" : "IDENTITY VERIFICATION NEEDED"}
                        </p>
                        
                        {!user ? (
                            <div className="space-y-4">
                                <p className="text-[var(--text-secondary)] mb-4">
                                    Create a secure identity to save your workspace and unlock 20 free credits.
                                </p>
                                <button 
                                    onClick={handleLogin}
                                    className="w-full py-4 bg-[var(--accent-amethyst-500)] text-[var(--text-inverse)] font-display text-xl tracking-widest hover:bg-[var(--accent-amethyst-700)] transition-colors rounded"
                                >
                                    LOGIN WITH GOOGLE
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-[var(--text-secondary)] mb-4">
                                    You have depleted your free allocation.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <a 
                                        href="https://buy.stripe.com/test_..." 
                                        target="_blank" 
                                        className="py-4 border border-[var(--accent-topaz-500)] text-[var(--accent-topaz-500)] font-mono text-xs flex flex-col items-center justify-center hover:bg-[var(--accent-topaz-500)] hover:text-white transition-colors rounded"
                                    >
                                        <span className="text-xl font-bold mb-1">50 CREDITS</span>
                                        <span>$5.00 USD</span>
                                    </a>
                                    <a 
                                        href="https://calendly.com/indradeva" 
                                        target="_blank" 
                                        className="py-4 border border-[var(--accent-emerald-500)] text-[var(--accent-emerald-500)] font-mono text-xs flex flex-col items-center justify-center hover:bg-[var(--accent-emerald-500)] hover:text-white transition-colors rounded"
                                    >
                                        <span className="text-xl font-bold mb-1">SESSION</span>
                                        <span>€50.00 / HR</span>
                                    </a>
                                </div>
                                <button onClick={() => setShowLoginModal(false)} className="text-[var(--text-muted)] text-xs mt-4 hover:text-[var(--text-primary)]">
                                    CANCEL
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* LEFT: VISUALIZER (Unchanged layout, just wiring) */}
            <div className="w-full md:w-1/3 flex flex-col gap-2 h-[300px] md:h-auto shrink-0 transition-all duration-700">
                {/* Header Stats */}
                <div className="flex justify-between items-center px-1 font-mono text-[10px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-2">
                        ENERGY: <span className="text-[var(--accent-emerald-500)]">{cartridge.credits.toFixed(1)}</span>
                        {user && <span className="text-[var(--accent-sapphire-500)]">[{user.displayName?.split(' ')[0]}]</span>}
                    </span>
                    <span>TENSION: <span className="text-[var(--accent-ruby-500)]">{cartridge.tension}%</span></span>
                </div>

                {/* THE CANVAS */}
                <div className="flex-1 relative border-2 border-[var(--line-soft)] rounded bg-[var(--bg-void)] overflow-hidden">
                    {/* ... (Existing Visualization Logic for Hero/Villain/Quadrants) ... */}
                    {isSetupPhase ? (
                        <div className="absolute inset-0 flex flex-row animate-in fade-in duration-500">
                            {/* HERO COLUMN */}
                            <div className="flex-1 border-r border-[var(--line-soft)] flex flex-col items-center justify-start pt-10 p-4 relative group hover:bg-[var(--accent-emerald-500)]/5 transition-colors">
                                <div className="w-full mb-2 text-left px-2">
                                    <h3 className="font-display text-xl md:text-2xl text-[var(--accent-emerald-500)] tracking-wider opacity-50 group-hover:opacity-100 transition-opacity">HERO</h3>
                                </div>
                                <div className="w-24 h-32 md:w-32 md:h-40 border-2 border-dashed border-[var(--accent-emerald-500)] rounded flex flex-col items-center justify-center bg-[var(--bg-surface)]/50 overflow-hidden relative">
                                    <span className="text-2xl opacity-50">🛡️</span>
                                    <span className="text-[8px] font-mono mt-2 text-[var(--accent-emerald-500)]">DRIVER</span>
                                </div>
                                <p className="font-mono text-[10px] text-center text-[var(--text-primary)] mt-4 px-2 leading-tight">
                                    {cartridge.hero.description || "Who fights for you?"}
                                </p>
                            </div>

                            {/* VILLAIN COLUMN */}
                            <div className="flex-1 flex flex-col items-center justify-start pt-10 p-4 relative group hover:bg-[var(--accent-ruby-500)]/5 transition-colors">
                                <div className="w-full mb-2 text-right px-2">
                                    <h3 className="font-display text-xl md:text-2xl text-[var(--accent-ruby-500)] tracking-wider opacity-50 group-hover:opacity-100 transition-opacity">VILLAIN</h3>
                                </div>
                                <div className="w-24 h-32 md:w-32 md:h-40 border-2 border-dashed border-[var(--accent-ruby-500)] rounded flex flex-col items-center justify-center bg-[var(--bg-surface)]/50 overflow-hidden relative">
                                    <span className="text-2xl opacity-50">⚔️</span>
                                    <span className="text-[8px] font-mono mt-2 text-[var(--accent-ruby-500)]">BARRIER</span>
                                </div>
                                <p className="font-mono text-[10px] text-center text-[var(--text-primary)] mt-4 px-2 leading-tight">
                                    {cartridge.villain.description || "What blocks you?"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* MODE B: 4-QUADRANTS (Execution Phase) */
                        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 bg-[var(--bg-void)] p-1 animate-in fade-in zoom-in duration-1000">
                             {/* Strategy */}
                             <div className={`relative p-2 border rounded transition-all duration-500 border-[var(--accent-emerald-500)]/30 bg-[var(--accent-emerald-500)]/5 ${isQActive('strategy') ? 'bg-[var(--accent-emerald-500)]/20 border-[var(--accent-emerald-500)] scale-[0.98]' : 'hover:border-[var(--accent-emerald-500)]/60'}`}>
                                 <div className="absolute bottom-0 left-0 w-full bg-[var(--accent-emerald-500)]/20 transition-all duration-1000 ease-out" style={{height: `${cartridge.quadrants.strategy.level}%`}}></div>
                                 <span className="text-[var(--accent-emerald-500)] font-mono text-[10px] font-bold tracking-widest absolute top-2 left-2">STRATEGY</span>
                                 {isSystematizing && <span className="absolute inset-0 flex items-center justify-center text-[var(--accent-emerald-500)] animate-pulse text-xs font-mono">SCANNING...</span>}
                             </div>
                             {/* Creative */}
                             <div className={`relative p-2 border rounded transition-all duration-500 border-[var(--accent-amethyst-500)]/30 bg-[var(--accent-amethyst-500)]/5 ${isQActive('creative') ? 'bg-[var(--accent-amethyst-500)]/20 border-[var(--accent-amethyst-500)] scale-[0.98]' : 'hover:border-[var(--accent-amethyst-500)]/60'}`}>
                                 <div className="absolute bottom-0 left-0 w-full bg-[var(--accent-amethyst-500)]/20 transition-all duration-1000 ease-out" style={{height: `${cartridge.quadrants.creative.level}%`}}></div>
                                 <span className="text-[var(--accent-amethyst-500)] font-mono text-[10px] font-bold tracking-widest absolute top-2 right-2">CREATIVE</span>
                                 {isSystematizing && <span className="absolute inset-0 flex items-center justify-center text-[var(--accent-amethyst-500)] animate-pulse text-xs font-mono">SCANNING...</span>}
                             </div>
                             {/* Producing */}
                             <div className={`relative p-2 border rounded transition-all duration-500 border-[var(--accent-sapphire-500)]/30 bg-[var(--accent-sapphire-500)]/5 ${isQActive('producing') ? 'bg-[var(--accent-sapphire-500)]/20 border-[var(--accent-sapphire-500)] scale-[0.98]' : 'hover:border-[var(--accent-sapphire-500)]/60'}`}>
                                 <div className="absolute bottom-0 left-0 w-full bg-[var(--accent-sapphire-500)]/20 transition-all duration-1000 ease-out" style={{height: `${cartridge.quadrants.producing.level}%`}}></div>
                                 <span className="text-[var(--accent-sapphire-500)] font-mono text-[10px] font-bold tracking-widest absolute bottom-2 left-2">PRODUCING</span>
                                 {isSystematizing && <span className="absolute inset-0 flex items-center justify-center text-[var(--accent-sapphire-500)] animate-pulse text-xs font-mono">SCANNING...</span>}
                             </div>
                             {/* Media */}
                             <div className={`relative p-2 border rounded transition-all duration-500 border-[var(--accent-ruby-500)]/30 bg-[var(--accent-ruby-500)]/5 ${isQActive('media') ? 'bg-[var(--accent-ruby-500)]/20 border-[var(--accent-ruby-500)] scale-[0.98]' : 'hover:border-[var(--accent-ruby-500)]/60'}`}>
                                 <div className="absolute bottom-0 left-0 w-full bg-[var(--accent-ruby-500)]/20 transition-all duration-1000 ease-out" style={{height: `${cartridge.quadrants.media.level}%`}}></div>
                                 <span className="text-[var(--accent-ruby-500)] font-mono text-[10px] font-bold tracking-widest absolute bottom-2 right-2">MEDIA</span>
                                 {isSystematizing && <span className="absolute inset-0 flex items-center justify-center text-[var(--accent-ruby-500)] animate-pulse text-xs font-mono">SCANNING...</span>}
                             </div>
                        </div>
                    )}
                    
                    {/* The Heart (Central Node) */}
                    {!isNameUndefined && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto group">
                             <div className="w-4 h-4 rounded-full bg-white border-2 border-[var(--bg-void)] shadow-[0_0_20px_white] transition-all"
                                style={{ 
                                    animation: isSetupPhase ? 'none' : `pulse ${1 / (0.5 + (cartridge.tension / 20))}s infinite ease-in-out`,
                                    opacity: isSetupPhase ? 0.5 : 1,
                                    transform: isSystematizing ? 'scale(1.5)' : 'scale(1)'
                                }}
                             ></div>
                        </div>
                    )}
                </div>
                
                {/* Status Bar */}
                <div className="h-8 border border-[var(--line-soft)] rounded flex items-center justify-center bg-[var(--bg-surface)]">
                    <span className="font-mono text-[10px] text-[var(--text-secondary)] animate-pulse tracking-widest">
                        {isSystematizing ? "INDRA: SYSTEMATIZING..." : (isThinking ? "AMBIKA: ANALYZING..." : "AMBIKA: LISTENING")}
                    </span>
                </div>
            </div>

            {/* RIGHT: CHAT INTERFACE */}
            <div className="flex-1 flex flex-col border-2 border-[var(--line-soft)] rounded bg-[var(--bg-canvas)] relative overflow-hidden min-h-0">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm scrollbar-thin">
                    {cartridge.chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded ${
                                msg.role === 'user' 
                                ? 'bg-[var(--accent-amethyst-500)]/10 border border-[var(--accent-amethyst-500)]/30 text-[var(--text-primary)]' 
                                : (msg.role === 'system' ? 'bg-[var(--accent-topaz-500)]/10 border border-[var(--accent-topaz-500)] text-[var(--accent-topaz-500)]' : 'bg-[var(--bg-surface)] border border-[var(--line-soft)] text-[var(--text-secondary)]')
                            }`}>
                                {msg.role === 'model' && <span className="text-[9px] text-[var(--accent-topaz-500)] block mb-1 tracking-widest uppercase">Ambika</span>}
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                         <div className="flex justify-start">
                             <div className="max-w-[85%] p-3 rounded bg-[var(--bg-surface)] border border-[var(--line-soft)]">
                                 <div className="flex gap-1">
                                     <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                     <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                     <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                                 </div>
                             </div>
                         </div>
                    )}
                </div>
                
                {/* Action Buttons */}
                {!isSetupPhase && (
                    <div className="absolute top-4 right-4 flex gap-2">
                         {cartridge.quadrants.strategy.level > 0 && (
                             <button 
                                onClick={handleEnterArcade}
                                className="bg-[var(--bg-surface)] border border-[var(--accent-topaz-500)] text-[var(--accent-topaz-500)] px-3 py-1 text-xs font-mono rounded hover:bg-[var(--accent-topaz-500)] hover:text-white transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse"
                            >
                                 ENTER ARCADE
                             </button>
                         )}
                         <button 
                            onClick={handleExport}
                            className="bg-[var(--bg-surface)] border border-[var(--accent-emerald-500)] text-[var(--accent-emerald-500)] px-3 py-1 text-xs font-mono rounded hover:bg-[var(--accent-emerald-500)] hover:text-white transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                             SAVE CODE
                         </button>
                         {user && (
                             <button 
                                onClick={logout}
                                className="bg-[var(--bg-surface)] border border-[var(--accent-ruby-500)] text-[var(--accent-ruby-500)] px-3 py-1 text-xs font-mono rounded hover:bg-[var(--accent-ruby-500)] hover:text-white transition-colors"
                             >
                                LOGOUT
                             </button>
                         )}
                    </div>
                )}

                <div className="p-2 border-t border-[var(--line-soft)] bg-[var(--bg-surface)] flex gap-2 shrink-0">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={cartridge.credits < 1.0 ? "RECHARGE REQUIRED" : (isNameUndefined ? "Enter your name..." : (isSetupPhase ? "Describe Hero/Villain..." : "Command Ambika..."))}
                        disabled={isThinking || cartridge.credits < 1.0}
                        className="flex-1 bg-[var(--bg-void)] border border-[var(--line-soft)] rounded px-3 py-2 text-sm font-mono focus:border-[var(--accent-amethyst-500)] focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                        autoFocus
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={isThinking || !input.trim() || cartridge.credits < 1.0}
                        className="px-4 bg-[var(--accent-topaz-500)] text-[var(--text-inverse)] font-bold font-mono text-xs rounded hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemWorkspace;

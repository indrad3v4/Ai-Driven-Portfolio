
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { InsightCartridge, updateCartridgeProgress } from '../lib/insight-object';
import { chatWithManagerAgent, chatWithTechAgent } from '../services/gemini';
import { subscribeToAuth, savePublicCartridge, loadPublicCartridge } from '../services/auth-service';
import { User } from 'firebase/auth';
import ManifestVisualizer from './ManifestVisualizer';
import { triggerDownload } from '../lib/system-serializer';

interface Props {
    cartridge: InsightCartridge;
    onUpdate: (update: InsightCartridge | ((prev: InsightCartridge) => InsightCartridge)) => void;
    theme: 'DARK' | 'LIGHT';
    onAdminGrant: () => void;
    onNetworkError?: () => void;
    onOpenCalendar?: () => void;
}

const CabinetKey: React.FC<{ id: string }> = ({ id }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2 bg-[var(--bg-void)] border border-[var(--accent-sapphire-500)] rounded px-3 py-1">
            <span className="text-[9px] font-mono text-[var(--accent-sapphire-500)] uppercase tracking-widest">CABINET KEY:</span>
            <code className="text-[10px] font-mono text-white select-all">{id.slice(0, 8)}...</code>
            <button onClick={handleCopy} className="text-[10px] hover:text-white text-[var(--text-muted)] transition-colors">
                {copied ? "COPIED" : "📋"}
            </button>
        </div>
    );
};

const SystemWorkspace: React.FC<Props> = ({ cartridge, onUpdate, theme, onAdminGrant, onNetworkError, onOpenCalendar }) => {
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [mobileTab, setMobileTab] = useState<'CHAT' | 'MANIFEST'>('CHAT'); // Mobile View Toggle
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Auth State
    const [user, setUser] = useState<User | null>(null);
    
    // Listen to Auth
    useEffect(() => {
        const unsubscribe = subscribeToAuth(async (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Derived State
    const isTechMode = cartridge.mode === 'TECH_TASK';
    const isNameUndefined = !cartridge.userName || cartridge.userName === "UNDEFINED";
    const isSprintReady = cartridge.ambikaStage === 7;
    const isSprintLocked = cartridge.ambikaStage === 8;
    
    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [cartridge.chatHistory, mobileTab]);

    // Initial Greeting
    useEffect(() => {
        if (cartridge.chatHistory.length === 0) {
            // Invisible system trigger
            handleSend("SYSTEM_START_PROTOCOL_INIT", true);
        }
    }, []);

    const handleSend = async (forcedMsg?: string, isSystem = false) => {
        const msg = forcedMsg || input;
        if (!msg.trim()) return;
        if (!isSystem) setInput('');

        // 0. MAGIC RESTORE CHECK
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!isSystem && uuidRegex.test(msg.trim())) {
            setIsThinking(true);
            const loaded = await loadPublicCartridge(msg.trim());
            if (loaded) {
                const restoredHistory = [
                    ...loaded.chatHistory,
                    { role: 'system' as const, content: `[SYSTEM]: SESSION RESTORED FROM KEY: ${msg.trim()}` }
                ];
                const restoredCartridge = { ...loaded, chatHistory: restoredHistory };
                onUpdate(restoredCartridge);
                setIsThinking(false);
                return; // Stop normal flow
            }
        }

        // 1. Optimistic Update (User Message) - Functional update for safety
        if (!isSystem) {
            onUpdate(prev => ({
                ...prev,
                chatHistory: [...prev.chatHistory, { role: 'user' as const, content: msg }]
            }));
        }

        setIsThinking(true);

        try {
            // 2. AI Call
            // Construct context based on current prop + msg to ensure Agent has latest context
            const contextCartridge = {
                ...cartridge,
                chatHistory: isSystem 
                    ? cartridge.chatHistory 
                    : [...cartridge.chatHistory, { role: 'user' as const, content: msg }]
            };

            let result;
            if (isTechMode) {
                result = await chatWithTechAgent(msg, contextCartridge);
            } else {
                result = await chatWithManagerAgent(msg, contextCartridge);
            }

            // 3. Process Response
            if (result.error) throw new Error(result.error);

            // 4. Apply updates securely using FUNCTIONAL UPDATE
            // This ensures we build upon the most recent state (including the optimistic user msg)
            onUpdate(prev => {
                const nextCartridge = updateCartridgeProgress(prev, {
                    ...result.updatedCartridge,
                    chatHistory: [...prev.chatHistory, { role: 'model' as const, content: result.text }]
                });
                
                // 5. AUTO-SAVE to Public DB (Side Effect)
                savePublicCartridge(nextCartridge).catch(err => console.error("Auto-save failed", err));
                
                return nextCartridge;
            });

        } catch (e) {
            console.error("Agent Error:", e);
            if (onNetworkError) onNetworkError();
        } finally {
            setIsThinking(false);
        }
    };

    const handleLockSprint = () => {
        onUpdate(prev => {
            const next = updateCartridgeProgress(prev, { ambikaStage: 8 });
            // Chain the system message trigger
            setTimeout(() => handleSend("LOCK SPRINT CONFIRMED", true), 0);
            return next;
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const downloadCode = () => {
        const code = cartridge.ambikaData.mainPyOutline || "# System initializing...";
        triggerDownload("main.py", code);
    };

    const downloadBrief = () => {
        const brief = cartridge.ambikaData.briefSummary || "Brief initializing...";
        triggerDownload("SYSTEM_BRIEF.md", brief);
    };

    // Helper to render basic markdown bolding
    const renderMessageContent = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-[var(--text-primary)] font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="flex flex-col h-full gap-4 relative">
            
            {/* --- TOP HEADER --- */}
            <div className="shrink-0 z-20 flex flex-col gap-2 pb-2 border-b border-[var(--line-soft)]">
                <div className="flex justify-between items-end">
                    <div className="font-display text-2xl text-[var(--text-primary)] tracking-widest">
                        {isTechMode ? "TECH PROTOCOL" : "SYSTEM ARCHITECT"}
                    </div>
                    
                    <div className="flex gap-4 items-center">
                        {/* ARTIFACTS PANEL (Desktop) */}
                        <div className="hidden md:flex gap-2 animate-in fade-in duration-500">
                             {(cartridge.ambikaData.mainPyOutline || cartridge.ambikaData.briefSummary) && (
                                <>
                                    <button onClick={downloadCode} className="flex items-center gap-1 text-[9px] font-mono text-[var(--accent-topaz-500)] border border-[var(--accent-topaz-500)]/30 bg-[var(--accent-topaz-500)]/10 px-2 py-1 rounded hover:bg-[var(--accent-topaz-500)] hover:text-[var(--bg-void)] transition-colors" title="Download Auto-Generated Python Code">
                                        <span>🐍</span> main.py
                                    </button>
                                    <button onClick={downloadBrief} className="flex items-center gap-1 text-[9px] font-mono text-[var(--accent-sapphire-500)] border border-[var(--accent-sapphire-500)]/30 bg-[var(--accent-sapphire-500)]/10 px-2 py-1 rounded hover:bg-[var(--accent-sapphire-500)] hover:text-[var(--bg-void)] transition-colors" title="Download Technical Brief">
                                        <span>📄</span> Brief.pdf
                                    </button>
                                </>
                             )}
                        </div>
                        {!isNameUndefined && <div className="hidden md:block"><CabinetKey id={cartridge.id} /></div>}
                    </div>
                </div>

                {/* MOBILE CONTROLS ROW */}
                <div className="flex md:hidden justify-between items-center w-full gap-2">
                    {/* View Toggle */}
                    <div className="flex bg-[var(--bg-surface)] rounded p-1 border border-[var(--line-soft)]">
                        <button 
                            onClick={() => setMobileTab('CHAT')}
                            className={`px-3 py-1 text-[9px] font-mono font-bold rounded transition-colors ${mobileTab === 'CHAT' ? 'bg-[var(--accent-amethyst-500)] text-white' : 'text-[var(--text-muted)]'}`}
                        >
                            TERMINAL
                        </button>
                        <button 
                            onClick={() => setMobileTab('MANIFEST')}
                            className={`px-3 py-1 text-[9px] font-mono font-bold rounded transition-colors ${mobileTab === 'MANIFEST' ? 'bg-[var(--accent-emerald-500)] text-[var(--bg-void)]' : 'text-[var(--text-muted)]'}`}
                        >
                            SYSTEM STATE
                        </button>
                    </div>

                    {/* Mobile Artifacts */}
                    {(cartridge.ambikaData.mainPyOutline || cartridge.ambikaData.briefSummary) && (
                        <div className="flex gap-1">
                             <button onClick={downloadCode} className="text-[12px] p-1.5 rounded bg-[var(--accent-topaz-500)]/10 text-[var(--accent-topaz-500)] border border-[var(--accent-topaz-500)]/30">🐍</button>
                             <button onClick={downloadBrief} className="text-[12px] p-1.5 rounded bg-[var(--accent-sapphire-500)]/10 text-[var(--accent-sapphire-500)] border border-[var(--accent-sapphire-500)]/30">📄</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MAIN BATTLEFIELD (SPLIT VIEW) --- */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 relative">
                
                {/* LEFT: VISUALIZER (The "Party Status") */}
                {/* Logic: Hidden on mobile unless tab is MANIFEST. Always visible on Desktop. */}
                <div className={`${mobileTab === 'MANIFEST' ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 bg-[var(--bg-surface)]/50 border border-[var(--line-soft)] rounded overflow-hidden flex-col h-full absolute md:relative z-10 inset-0 md:inset-auto`}>
                    <ManifestVisualizer 
                        cartridge={cartridge} 
                        onLockSlot={onOpenCalendar} 
                    />
                </div>

                {/* RIGHT: CHAT (The "Combat Log") */}
                {/* Logic: Hidden on mobile if tab is MANIFEST. Always visible on Desktop. */}
                <div className={`${mobileTab === 'CHAT' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-h-0 bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded relative h-full`}>
                    
                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" ref={scrollRef}>
                        {cartridge.chatHistory.map((msg, i) => {
                            if (msg.role === 'system') {
                                return (
                                    <div key={i} className="flex justify-center my-4">
                                        <span className="text-[10px] font-mono text-[var(--accent-emerald-500)] border border-[var(--accent-emerald-500)] px-2 py-1 rounded bg-[var(--accent-emerald-500)]/10">
                                            {msg.content}
                                        </span>
                                    </div>
                                );
                            }
                            const isUser = msg.role === 'user';
                            return (
                                <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] md:max-w-[85%] p-3 rounded text-sm md:text-base font-mono leading-relaxed whitespace-pre-wrap ${
                                        isUser 
                                            ? 'bg-[var(--accent-amethyst-500)]/10 border border-[var(--accent-amethyst-500)] text-[var(--text-primary)]' 
                                            : 'bg-[var(--bg-void)] border border-[var(--line-soft)] text-[var(--text-secondary)]'
                                    }`}>
                                        {msg.role === 'model' && <span className="text-[var(--accent-emerald-500)] font-bold mr-2">{isTechMode ? 'TRINITY >' : 'AMBIKA >'}</span>}
                                        {renderMessageContent(msg.content)}
                                    </div>
                                </div>
                            );
                        })}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--bg-void)] border border-[var(--line-soft)] p-3 rounded text-xs font-mono text-[var(--text-muted)] animate-pulse">
                                    CALCULATING...
                                </div>
                            </div>
                        )}
                        
                        {/* FINAL LOCK BUTTON (EMBEDDED IN CHAT FOR IMPACT) */}
                        {isSprintReady && !isThinking && (
                            <div className="flex justify-center mt-6 mb-2 animate-in zoom-in duration-500">
                                <button 
                                    onClick={handleLockSprint}
                                    className="px-8 py-4 bg-[var(--accent-amethyst-500)] text-white font-display text-xl tracking-widest rounded hover:scale-105 transition-transform shadow-[0_0_30px_rgba(157,78,221,0.5)] border-2 border-white/20"
                                >
                                    LOCK SPRINT — €{cartridge.ambikaData?.costEstimate?.cost || '0'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-2 border-t border-[var(--line-soft)] bg-[var(--bg-surface)] shrink-0">
                        {isSprintLocked ? (
                            <div className="p-3 text-center text-[var(--accent-emerald-500)] font-mono text-sm border border-[var(--accent-emerald-500)] rounded bg-[var(--accent-emerald-500)]/10">
                                🔒 SYSTEM LOCKED. CHECK YOUR INBOX FOR TRANSMISSION.
                            </div>
                        ) : (
                            <div className="relative flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isNameUndefined ? "ENTER NAME OR PASTE KEY TO RESTORE..." : "TYPE TO ARCHITECT YOUR VISION..."}
                                    className="flex-1 bg-[var(--bg-void)] border border-[var(--line-soft)] text-[var(--text-primary)] p-3 rounded font-mono text-sm focus:border-[var(--accent-amethyst-500)] focus:outline-none focus:shadow-[0_0_15px_rgba(157,78,221,0.2)] transition-all"
                                    disabled={isThinking}
                                    autoFocus
                                />
                                <button 
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isThinking}
                                    className="p-3 bg-[var(--accent-amethyst-500)] text-white font-bold rounded hover:bg-[var(--accent-amethyst-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isThinking ? '...' : 'SEND'}
                                </button>
                            </div>
                        )}
                        {/* BOSS RAID BUTTON (Green) */}
                        <div className="mt-2">
                             <button 
                                onClick={onOpenCalendar}
                                className="w-full py-2 bg-[var(--accent-emerald-500)]/10 border border-[var(--accent-emerald-500)] text-[var(--accent-emerald-500)] text-xs font-bold font-mono rounded hover:bg-[var(--accent-emerald-500)] hover:text-[var(--bg-void)] transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                             >
                                 SUMMON INDRA (BOSS RAID)
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemWorkspace;

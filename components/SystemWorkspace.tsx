
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { InsightCartridge, updateCartridgeProgress } from '../lib/insight-object';
import { chatWithManagerAgent } from '../services/gemini';
import { savePublicCartridge } from '../services/auth-service';
import ManifestVisualizer from './ManifestVisualizer';
import { triggerDownload } from '../lib/system-serializer';

interface Props {
    cartridge: InsightCartridge;
    onUpdate: (update: InsightCartridge | ((prev: InsightCartridge) => InsightCartridge)) => void;
    theme: 'DARK' | 'LIGHT';
    language: 'EN' | 'PL' | 'BEL';
    onAdminGrant: () => void;
    onOpenCalendar?: () => void;
}

const SystemWorkspace: React.FC<Props> = ({ cartridge, onUpdate, theme, language, onOpenCalendar }) => {
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isBooting, setIsBooting] = useState(false);
    const [groundingUrls, setGroundingUrls] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasBooted = useRef(false);
    
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [cartridge?.chatHistory, isThinking, isBooting]);

    useEffect(() => {
        if (cartridge && cartridge.chatHistory.length === 0 && !hasBooted.current) {
            hasBooted.current = true;
            
            const bootSystemWithRetry = async (maxRetries = 3) => {
                setIsBooting(true);
                
                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        const handshakeResult = await chatWithManagerAgent("SYSTEM_INIT_HANDSHAKE", cartridge, language);
                        
                        onUpdate(prev => ({
                            ...prev,
                            ...handshakeResult.updatedCartridge,
                            chatHistory: [{ role: 'model', content: handshakeResult.text }]
                        }));
                        
                        setIsBooting(false);
                        return;

                    } catch (e: any) {
                        if (attempt < maxRetries) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } else {
                            onUpdate(p => ({ 
                                ...p, 
                                chatHistory: [{ role: 'model', content: "Neural link unstable. Manual override engaged. What is your name, Architect?" }] 
                            }));
                        }
                    }
                }
                setIsBooting(false);
            };
            
            bootSystemWithRetry();
        }
    }, [cartridge?.id, language]);

    const handleSend = async (forcedMsg?: string) => {
        const msg = forcedMsg || input;
        if (!msg.trim() || isThinking || isBooting) return;
        
        setInput('');
        onUpdate(prev => ({
            ...prev,
            chatHistory: [...(prev.chatHistory || []), { role: 'user' as const, content: msg }]
        }));

        setIsThinking(true);
        try {
            const result = await chatWithManagerAgent(msg, cartridge, language);
            if (result.searchUrls) setGroundingUrls(result.searchUrls);
            
            onUpdate(prev => {
                const next = updateCartridgeProgress(prev, {
                    ...result.updatedCartridge,
                    chatHistory: [...(prev.chatHistory || []), { role: 'model' as const, content: result.text }]
                });
                savePublicCartridge(next).catch(() => {});
                return next;
            });
        } finally {
            setIsThinking(false);
        }
    };

    const isSystemLocked = isThinking || isBooting;
    const ambikaData = cartridge?.ambikaData || {};

    return (
        <div className="flex flex-col h-full relative overflow-hidden font-mono">
            <div className="absolute top-0 right-0 z-50 p-2 flex flex-col items-end gap-1 pointer-events-none">
                <div className="pointer-events-auto bg-[var(--bg-void)]/90 border border-[var(--accent-topaz-500)]/30 px-2 py-1 rounded shadow-lg">
                    <span className="text-[7px] text-[var(--text-muted)] block uppercase tracking-tighter">Cabinet Key (Restore Session)</span>
                    <span className="text-[9px] text-[var(--accent-topaz-500)] font-bold select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(cartridge.id)}>
                        {cartridge.id}
                    </span>
                </div>
                <div className="flex gap-1">
                    {ambikaData.mainPyCode && (
                        <button onClick={() => triggerDownload('main.py', ambikaData.mainPyCode!)} className="pointer-events-auto px-2 py-1 bg-[var(--accent-sapphire-500)] text-[8px] text-white rounded">💾 .PY</button>
                    )}
                    {ambikaData.briefPdfContent && (
                        <button onClick={() => triggerDownload('brief.md', ambikaData.briefPdfContent!)} className="pointer-events-auto px-2 py-1 bg-[var(--accent-emerald-500)] text-[8px] text-black font-bold rounded">📄 .MD</button>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 overflow-hidden">
                <div className="w-full md:w-[28%] shrink-0 border border-[var(--line-soft)] rounded overflow-hidden h-[110px] md:h-full bg-[var(--bg-void)]/80">
                    <ManifestVisualizer cartridge={cartridge} />
                </div>

                <div className="flex-1 flex flex-col bg-[var(--bg-surface)]/60 border border-[var(--line-soft)] rounded overflow-hidden min-h-0 relative">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" ref={scrollRef}>
                        {isBooting && cartridge.chatHistory.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <div className="w-10 h-10 border-4 border-[var(--accent-emerald-500)] border-t-transparent rounded-full animate-spin"></div>
                                <div className="text-[10px] text-[var(--accent-emerald-500)] tracking-[0.4em] animate-pulse uppercase">INITIATING PARTNERSHIP...</div>
                            </div>
                        )}
                        {cartridge.chatHistory?.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[92%] p-3 rounded text-[11px] md:text-sm leading-relaxed shadow-md border ${
                                    msg.role === 'user' ? 'bg-[var(--accent-amethyst-500)]/10 border-[var(--accent-amethyst-500)]/30 text-white' : 'bg-[var(--bg-void)]/90 border-[var(--line-soft)] text-[var(--text-secondary)]'
                                }`}>
                                    {msg.role === 'model' && <div className="text-[var(--accent-emerald-500)] mb-1 font-bold text-[9px] uppercase tracking-tighter">AMBIKA_UPLINK</div>}
                                    {msg.content}
                                    {msg.role === 'model' && groundingUrls.length > 0 && i === cartridge.chatHistory.length - 1 && (
                                        <div className="mt-2 pt-2 border-t border-[var(--line-soft)]">
                                            <p className="text-[8px] text-[var(--text-muted)] uppercase mb-1">Grounding Sources:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {groundingUrls.map((url, idx) => <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-[8px] text-[var(--accent-sapphire-500)] hover:underline truncate max-w-[150px]">{url}</a>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isThinking && <div className="flex justify-start"><div className="bg-[var(--bg-void)]/60 px-3 py-2 rounded text-[10px] text-[var(--accent-emerald-500)] animate-pulse border border-[var(--accent-emerald-500)]/30">[SYNCING NEURAL LINK...]</div></div>}
                    </div>

                    <div className="p-2 md:p-4 bg-[var(--bg-overlay)]/95 border-t border-[var(--line-soft)]">
                        {cartridge.ambikaStage === 8 && (
                            <button onClick={onOpenCalendar} className="w-full py-3 bg-[var(--accent-topaz-500)] text-black font-bold text-[11px] rounded mb-3 shadow-lg">🗓️ LOCK PRODUCTION SPRINT</button>
                        )}
                        <div className="flex gap-2">
                            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !isSystemLocked && handleSend()} placeholder={isSystemLocked ? "SYNCING..." : "Architect's input..."} className="flex-1 bg-[var(--bg-void)] border border-[var(--line-soft)] text-white p-2 rounded text-xs md:text-sm focus:outline-none" disabled={isSystemLocked} />
                            <button onClick={() => handleSend()} disabled={!input.trim() || isSystemLocked} className="px-6 bg-[var(--accent-amethyst-500)] text-white font-bold rounded shadow-lg">↵</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemWorkspace;

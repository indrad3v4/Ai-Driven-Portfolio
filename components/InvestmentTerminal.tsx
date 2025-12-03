/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import RetroButton from './RetroButton';

interface Props {
    title: string;
    content: string; // Markdown text
    onClose: () => void;
    id?: string; // Slug for deep linking
}

const InvestmentTerminal: React.FC<Props> = ({ title, content, onClose, id }) => {
    const [copied, setCopied] = useState<string | null>(null);

    const BTC_ADDR = "bc1q5am2mqlnzymv6q3sc5neu0s6ladz8pe588l3nh";
    const ETH_ADDR = "0x7aFd29D3D385dedE35970f2690335F18e332C015";

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleShare = () => {
        if (!id) return;
        const url = `${window.location.origin}?portfolio=${id}`;
        navigator.clipboard.writeText(url);
        setCopied('LINK');
        setTimeout(() => setCopied(null), 2000);
    };

    // Robust markdown renderer
    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, i) => {
            // Process inline bolding first: **text** -> <strong>text</strong>
            // Using logic instead of dangerouslySetInnerHTML for simpler implementation if possible,
            // but for mixed content (bold in middle of sentence), fragments are better.
            
            const parseInline = (text: string) => {
                const parts = text.split(/(\*\*.*?\*\*)/g);
                return parts.map((part, idx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={idx} className="text-[var(--text-primary)] font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                });
            };

            if (line.startsWith('# ')) {
                return <h1 key={i} className="text-2xl font-display text-[var(--accent-topaz-500)] mt-6 mb-4 border-b border-[var(--line-soft)] pb-2">{line.replace('# ', '')}</h1>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-display text-[var(--text-primary)] mt-6 mb-3 uppercase tracking-wider">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('---')) {
                return <hr key={i} className="border-[var(--line-soft)] my-6" />;
            }
            if (line.startsWith('- ')) {
                return <li key={i} className="ml-4 list-disc text-[var(--text-secondary)] mb-1 pl-2 marker:text-[var(--accent-emerald-500)]">{parseInline(line.replace('- ', ''))}</li>;
            }
            if (line.startsWith('✅')) {
                 return <div key={i} className="text-[var(--accent-emerald-500)] mb-1 font-bold">{parseInline(line)}</div>;
            }
            // Standard paragraph (with potential bolding)
            if (line.trim().length > 0) {
                 return <p key={i} className="text-[var(--text-secondary)] mb-2 leading-relaxed whitespace-pre-wrap">{parseInline(line)}</p>;
            }
            return null; // Skip empty lines
        });
    };

    return (
        <div className="fixed inset-0 z-[150] bg-[var(--bg-void)]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
            <div className="max-w-4xl w-full bg-[var(--bg-canvas)] border-2 border-[var(--accent-emerald-500)] rounded-[var(--radius-lg)] shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col max-h-[90vh] overflow-hidden relative">
                
                {/* Header */}
                <div className="p-4 border-b border-[var(--line-soft)] bg-[var(--bg-surface)] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[var(--accent-emerald-500)] rounded-full animate-pulse"></div>
                        <div>
                            <h2 className="font-display text-xl text-[var(--accent-emerald-500)] tracking-widest">CLASSIFIED INTELLIGENCE DOSSIER</h2>
                            <p className="font-mono text-[9px] text-[var(--text-muted)]">EYES ONLY // {title.toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {id && (
                            <button 
                                onClick={handleShare}
                                className="text-[10px] font-mono border border-[var(--line-soft)] px-2 py-1 rounded hover:bg-[var(--accent-emerald-500)] hover:text-[var(--bg-void)] transition-colors flex items-center gap-1"
                            >
                                {copied === 'LINK' ? 'COPIED!' : 'SHARE UPLINK'} <span>🔗</span>
                            </button>
                        )}
                        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition-colors">
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 font-mono text-sm scrollbar-thin">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex justify-end mb-8">
                             <span className="border border-[var(--accent-ruby-500)] text-[var(--accent-ruby-500)] px-2 py-1 text-[10px] uppercase font-bold tracking-widest -rotate-12 opacity-80">
                                 CONFIDENTIAL
                             </span>
                        </div>
                        {renderMarkdown(content)}
                    </div>
                </div>

                {/* Investment Footer */}
                <div className="p-6 bg-[var(--bg-surface)] border-t border-[var(--line-soft)] shrink-0">
                    <h3 className="font-display text-lg text-[var(--text-primary)] mb-4 text-center tracking-widest">
                        CRYPTOPUNK PATRONAGE
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* BTC */}
                        <div className="p-4 bg-[var(--bg-void)] border border-[var(--line-soft)] rounded flex flex-col gap-2 relative group hover:border-[#F7931A] transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-[#F7931A]">BITCOIN (BTC)</span>
                                <button 
                                    onClick={() => handleCopy(BTC_ADDR, 'BTC')}
                                    className="text-[10px] bg-[#F7931A]/10 text-[#F7931A] px-2 py-1 rounded hover:bg-[#F7931A] hover:text-white transition-colors"
                                >
                                    {copied === 'BTC' ? 'COPIED!' : 'COPY ADDRESS'}
                                </button>
                            </div>
                            <code className="text-[10px] text-[var(--text-muted)] break-all font-mono select-all">
                                {BTC_ADDR}
                            </code>
                        </div>

                        {/* ETH/USDT */}
                        <div className="p-4 bg-[var(--bg-void)] border border-[var(--line-soft)] rounded flex flex-col gap-2 relative group hover:border-[#627EEA] transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-[#627EEA]">USDT (ERC20/ETH)</span>
                                <button 
                                    onClick={() => handleCopy(ETH_ADDR, 'ETH')}
                                    className="text-[10px] bg-[#627EEA]/10 text-[#627EEA] px-2 py-1 rounded hover:bg-[#627EEA] hover:text-white transition-colors"
                                >
                                    {copied === 'ETH' ? 'COPIED!' : 'COPY ADDRESS'}
                                </button>
                            </div>
                            <code className="text-[10px] text-[var(--text-muted)] break-all font-mono select-all">
                                {ETH_ADDR}
                            </code>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase">
                            TRANSACTIONS GRANT 'VISIONARY STATUS' & ARCHITECT PRIORITY. NOT AN EQUITY OFFERING.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InvestmentTerminal;
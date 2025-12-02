
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import RetroButton from './RetroButton';

interface Project {
    title: string;
    desc: string;
    role: string;
    tech: string[];
    links: { site?: string; github?: string };
    liveTag: string;
}

const PROJECTS: Project[] = [
    {
        title: "DAOdiseo.app",
        desc: "Al-powered DApp for fractional real estate on Cosmos...",
        role: "Smart Contract Integration",
        tech: ["Next.js", "Gemini API", "Cosmos SDK"],
        links: { site: "#", github: "#" },
        liveTag: "Live on testnet"
    },
    {
        title: "Krakow Guide on AI",
        desc: "Data pipeline learned on corpus of data about Krakow.",
        role: "Data Engineering",
        tech: ["Next.js", "Gemini API", "RAG"],
        links: { github: "#" },
        liveTag: "Custom Knowledge Base"
    },
    {
        title: "Tsunami Prediction Agent",
        desc: "Deep learning agent for real-time tsunami prediction.",
        role: "Deep Learning Training & Prompt Tuning",
        tech: ["OpenAI Agents SDK", "DeepSeek API", "PyTorch"],
        links: { github: "#" },
        liveTag: "2-min real-time predictions"
    },
    {
        title: "Massloop AI System",
        desc: "Agentic AI system for music live performers.",
        role: "System Architecture",
        tech: ["Python", "OpenAI Agents SDK", "CometAPI"],
        links: { site: "#", github: "#" },
        liveTag: "Live Performance Ready"
    },
    {
        title: "System for Sterling Angels",
        desc: "Real-time agentic pipeline for summarizing financial documentation.",
        role: "Pipeline Integrity & Admin",
        tech: ["Python", "OpenAI Agents SDK", "DeepSeek", "Graphs"],
        links: { site: "https://huggingface.co/spaces/indradeva/ai-summarizator", github: "#" },
        liveTag: "90% Manual Work Saved"
    }
];

interface Props {
    onClose: () => void;
}

const SystemArchive: React.FC<Props> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-[var(--bg-void)]/95 backdrop-blur-xl overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-[var(--line-soft)] pb-4">
                    <div>
                        <h2 className="font-display text-4xl text-[var(--text-primary)] tracking-wider">SYSTEM ARCHIVE</h2>
                        <p className="font-mono text-xs text-[var(--text-secondary)] tracking-widest">SELECT A KERNEL TO FORK OR DEPLOY</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Project X (Hero) */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1 border-2 border-dashed border-[var(--line-soft)] rounded-lg p-6 flex flex-col justify-center items-center text-center bg-[var(--bg-surface)]/20 hover:bg-[var(--bg-surface)]/40 transition-colors group cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                             <span className="text-2xl">+</span>
                        </div>
                        <h3 className="font-display text-2xl text-[var(--text-primary)] mb-2">PROJECT X</h3>
                        <p className="font-mono text-xs text-[var(--accent-emerald-500)] tracking-widest mb-4">THE NEXT BIG THING</p>
                        <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-6">
                            Don't see what you need? Let's build a custom architecture from scratch.
                        </p>
                        <button className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--text-primary)] font-mono text-xs hover:border-[var(--accent-emerald-500)] transition-colors">
                            {">_"} INITIALIZE CUSTOM SPEC
                        </button>
                    </div>

                    {PROJECTS.map((p, i) => (
                        <div key={i} className="border border-[var(--border-soft)] rounded-lg bg-[var(--bg-surface)] p-6 hover:border-[var(--border-glow)] hover:shadow-[var(--shadow-glow-amethyst)] transition-all group flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-display text-2xl text-[var(--text-primary)] group-hover:text-[var(--accent-topaz-500)] transition-colors">
                                    {p.title}
                                </h3>
                                <div className="flex gap-2">
                                    {p.links.site && (
                                        <a href={p.links.site} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent-sapphire-500)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                        </a>
                                    )}
                                    <a href={p.links.github || "#"} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent-sapphire-500)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                    </a>
                                </div>
                            </div>

                            <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1">
                                {p.desc}
                            </p>

                            <div className="mb-4 p-3 bg-[var(--bg-void)]/50 rounded border border-[var(--line-soft)]">
                                <span className="block text-[10px] font-mono text-[var(--text-muted)] mb-1 uppercase tracking-wider">MY ROLE</span>
                                <span className="font-mono text-xs text-[var(--text-primary)]">{p.role}</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {p.tech.map(t => (
                                    <span key={t} className="px-2 py-1 text-[10px] font-mono border border-[var(--border-soft)] rounded text-[var(--text-muted)]">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto pt-4 border-t border-[var(--line-soft)] flex justify-between items-center">
                                <span className="font-mono text-[10px] text-[var(--accent-emerald-500)] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-emerald-500)] animate-pulse"></span>
                                    {p.liveTag}
                                </span>
                            </div>

                            <div className="mt-4">
                                <button className="w-full py-2 border border-[var(--line-soft)] rounded text-xs font-mono text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-white transition-all flex items-center justify-center gap-2 group-hover:border-[var(--border-glow)]">
                                     <span className="text-[var(--accent-topaz-500)]">{">_"}</span> INITIALIZE DEPLOYMENT
                                </button>
                                <div className="flex justify-between mt-1 px-1">
                                    <span className="text-[9px] font-mono text-[var(--text-muted)]">EST. COST: {Math.floor(Math.random() * 1000 + 500)} PLN</span>
                                    <span className="text-[9px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                                        <span>🚀</span> INSTANT FORK
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SystemArchive;

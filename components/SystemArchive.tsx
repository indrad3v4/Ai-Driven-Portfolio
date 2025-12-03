
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import RetroButton from './RetroButton';
import InvestmentTerminal from './InvestmentTerminal';

// --- PITCH DECKS ---

const MASSLOOP_PITCH = `# MASSLOOP.AI — INVESTOR PITCH DECK

---

## THE PROBLEM: Performance Anxiety + Authenticity Crisis

**Motif:** Musicians crave visible control & authentic expression.

**Barrier:** Current tools fragment artistic identity—DAWs feel robotic, DJ software mixes (not creates), AI generators sound generic, voice cloning sounds synthetic.

**Result:** Artists play it safe (lose authenticity) OR improvise raw (risk technical failure). No tool merges spontaneity + voice consistency + artist identity + visible control.

**Market Signal:** 80% of musicians experience performance anxiety. Audiences now scrutinize authenticity. Hardware control = perceived authenticity.

---

## THE SOLUTION: MASSLOOP.AI

**Stage-confidence amplifier.** Real-time track generation using performer's own voice + artist identity + MIDI button press (visible to crowd).

**Result:** Authentic improvisation without anxiety. Peak flow state. Psychological safety through visible control.

---

## WHY NOW

**Suno v5** – Quality finally live-ready.

**Authenticity demand** – Crowds value visible agency.

**EU underground exploding** – €13.66B market, 8.95% CAGR.

**EDM growth 8.2%** – €10.2B → €20.5B (2035), community-driven.

**Zero competitors** – No stage-first, voice-consistent, authenticity-preserving solution exists.

---

## THE MARKET

**TAM (Global Live Music):** €38.58B (2025) | 8.78% CAGR
**SAM (Gen AI Music):** €509.8M (2024) → €2.49B (2030) | 30.4% CAGR
**SOM (EU Underground):** €5–10M Year 1 (1–2% SAM) | Pilot-driven

**Primary:** EU underground electronic acts (1k–5k listeners, weekly touring, seeking differentiation).
**Secondary:** Venues wanting nightly curated programming. Aspiring artists seeking anxiety-free entry.

---

## THE TECH

- **Voice Consistency** – Performer's voice only, no generic AI
- **Semantic Prompting** – Artist identity (influences, mood, signature) baked in
- **Quality Auto-Check** – Librosa rejects clipped/off-tempo tracks before playback
- **Hardware-Native** – MIDI control (BPM, energy, style); zero typing
- **Clean Architecture** – 5-layer separation; sub-3s latency
- **Crowd Sensing (M2)** – Computer vision auto-adapts to energy
- **Zero Typing** – Knobs, buttons, faders only = visible authenticity

---

## BUSINESS MODEL

- **PAYG (No Free Tier)** – Simple token economics
- **5× Markup on Suno** – Transparent, sustainable
- **Linear Scaling** – Venue-by-venue expansion
- **Unit Economics:** 1 hour set (~15 tracks) = €3–5 revenue/night
- **Revenue Path:** €5–10M Year 1 → €30M+ valuation (18 months)

---

## MVP (M0): Launch-Ready

**Features:**
- One-hotkey generation <3s under venue load
- Zero-typing (MIDI/hardware only)
- 3-track pre-buffer
- Voice consistency locked to profile
- Quality auto-reject before playback

**Pilot:** 3 EU venues (Berlin/Amsterdam/Krakow), 5 acts, 8 weeks.

**Status:** Architecture complete. Voice tech final testing. Venues locked Month 2.

---

## TRACTION & VALIDATION

**Target:** Established EU underground act.

**Pilot Metrics:**
- 2+ unique sets/week per act
- Zero on-stage failures
- 4.5+ satisfaction (control + audience feedback)
- 80%+ repeat adoption

**Early Adopter:** 50% lifetime token discount (first 10 acts).

---

## TEAM & EXECUTION

- **Architecture:** 5-layer clean separation, production-ready
- **Voice Tech:** Suno v5 stable; voice cloning final validation
- **Analytics:** Real-time dashboards (cost, latency, quality, sentiment)

**Roadmap:**
- Month 1 (M0): Hotkey, zero-typing, pre-buffer live
- Month 2 (M1): Voice + reference blending, prompt refinement
- Month 3 (M2): Crowd sensing

---

## INVESTMENT: €50k Seed

**Use of Funds:**
- 40% (€20k) – Backend optimization, QA, voice tech finalization
- 30% (€15k) – Venue partnerships, early adopter support
- 20% (€10k) – Team (1 senior dev, 1 community manager)
- 10% (€5k) – Marketing, hardware pool

---

## EXIT VISION

**Massloop = OS for live electronic music generation.**

**Targets:** Splice, Serato, Ableton, Native Instruments.

**Path:** €5–10M Year 1 → €50–100M ARR Year 3 → €300M+ acquisition (6–10× revenue).
`;

const KRAKOW_PITCH = `# KRAKOW.AI — THE CITY OPERATING SYSTEM

---

## THE PROBLEM: The Expats & Tourist Disconnect

**Pain Point:** Expats and high-value tourists drown in SEO-spam. 
Finding "real" underground techno, reliable tax lawyers, or niche communities is impossible via Google or TripAdvisor.

**Result:** Friction. Isolation. Missed economic opportunities for local niche businesses.

**Market Failure:** Current city guides are static, ad-heavy, and generic. They don't know *you*.

---

## THE SOLUTION: KRAKOW.AI

A RAG-based City Agent grounded in local, verified, high-frequency data. 
Not a chatbot—a concierge.

**Features:**
- **Hyper-Local RAG:** Indexed 500+ niche locations (speakeasies, tax offices, coworking).
- **Real-Time Events:** Scrapes FB events, Telegram groups, and local forums.
- **Persona-Based:** "I am a crypto founder" -> Suggests tax lawyer + coworking + networking event.

---

## TRACTION

**Status:** Beta Live.
**Users:** 120 verified expats in pilot group.
**Data:** 500+ niche locations indexed.
**Engagement:** 45% daily active users in pilot.

---

## INVESTMENT: €25k Pre-Seed

**Goal:** Mobile App Launch + Data Expansion to Warsaw.

**Use of Funds:**
- 50% Engineering (Mobile App Wrapper)
- 30% Data Acquisition (Local Scrapers)
- 20% Marketing (Expat Communities)

`;

interface Project {
    id: string; // Slug for deep linking
    title: string;
    desc: string;
    role: string;
    tech: string[];
    links: { site?: string; github?: string };
    liveTag: string;
    scientificDiscovery?: string;
    isRaidWin?: boolean;
    isInvestable?: boolean;
    investment?: { cost: string; hours: number };
    pitchDeck?: string;
}

const PROJECTS: Project[] = [
    {
        id: "sterling-angels",
        title: "System for Sterling Angels",
        desc: "Real-time agentic pipeline for summarizing financial documentation.",
        role: "Pipeline Integrity & Admin",
        tech: ["Python", "OpenAI Agents SDK", "DeepSeek", "Graphs"],
        links: { site: "https://huggingface.co/spaces/indradeva/ai-summarizator", github: "#" },
        liveTag: "90% Manual Work Saved",
        investment: { cost: "€2,800", hours: 40 }
    },
    {
        id: "blackline-mlops",
        title: "BlackLine MLOps",
        desc: "Agentic MLOps system for automated model training and deployment.",
        role: "Lead Engineer",
        tech: ["Python", "MLflow", "Docker", "HuggingFace"],
        links: { github: "https://github.com/indrad3v4/BlackLine-MLops", site: "https://huggingface.co/indradeva" },
        liveTag: "Industrial Grade",
        investment: { cost: "€3,500", hours: 55 }
    },
    {
        id: "massloop",
        title: "Massloop AI System",
        desc: "Agentic AI system for music live performers.",
        role: "System Architecture",
        tech: ["Python", "OpenAI Agents SDK", "CometAPI"],
        links: { site: "#", github: "#" },
        liveTag: "Live Performance Ready",
        scientificDiscovery: "TRIZ #35: Dynamic tempo parameter adaptation based on audience noise floor.",
        isRaidWin: true,
        isInvestable: true,
        pitchDeck: MASSLOOP_PITCH
    },
    {
        id: "krakow-guide",
        title: "Krakow Guide on AI",
        desc: "Data pipeline learned on corpus of data about Krakow.",
        role: "Data Engineering",
        tech: ["Next.js", "Gemini API", "RAG"],
        links: { github: "#" },
        liveTag: "Custom Knowledge Base",
        isInvestable: true,
        pitchDeck: KRAKOW_PITCH
    },
    {
        id: "daodiseo",
        title: "DAOdiseo.app",
        desc: "Al-powered DApp for fractional real estate on Cosmos...",
        role: "Smart Contract Integration",
        tech: ["Next.js", "Gemini API", "Cosmos SDK"],
        links: { site: "#", github: "#" },
        liveTag: "Live on testnet",
        investment: { cost: "€3,200", hours: 64 }
    },
    {
        id: "tsunami-agent",
        title: "Tsunami Prediction Agent",
        desc: "Deep learning agent for real-time tsunami prediction.",
        role: "Raid Leader: User @oceanResearcher",
        tech: ["OpenAI Agents SDK", "DeepSeek API", "PyTorch"],
        links: { github: "#" },
        liveTag: "2-min real-time predictions",
        scientificDiscovery: "TRIZ #17: Added temporal improvisation layer to existing prediction models.",
        isRaidWin: true,
        investment: { cost: "€4,500", hours: 45 }
    }
];

interface Props {
    onClose: () => void;
    onOpenCalendar: () => void;
    onStartGame: () => void;
    initialDossierId?: string | null;
}

const SystemArchive: React.FC<Props> = ({ onClose, onOpenCalendar, onStartGame, initialDossierId }) => {
    const [selectedDeck, setSelectedDeck] = useState<{title: string, content: string, id: string} | null>(null);

    const getSafeLink = (url?: string) => url && url !== '#' ? url : 'https://github.com/indrad3v4';

    // Auto-open dossier if ID is provided via URL
    useEffect(() => {
        if (initialDossierId) {
            const project = PROJECTS.find(p => p.id === initialDossierId);
            if (project && project.isInvestable && project.pitchDeck) {
                setSelectedDeck({
                    title: project.title,
                    content: project.pitchDeck,
                    id: project.id
                });
            }
        }
    }, [initialDossierId]);

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--bg-void)]/95 backdrop-blur-xl overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300">
            
            {/* Investment Terminal Modal */}
            {selectedDeck && (
                <InvestmentTerminal 
                    id={selectedDeck.id}
                    title={selectedDeck.title} 
                    content={selectedDeck.content} 
                    onClose={() => setSelectedDeck(null)} 
                />
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-[var(--line-soft)] pb-4">
                    <div>
                        <h2 className="font-display text-3xl md:text-4xl text-[var(--accent-topaz-500)] tracking-wider drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                            RAID VICTORIES_ (PORTFOLIO)
                        </h2>
                        <p className="font-mono text-xs text-[var(--text-secondary)] tracking-widest uppercase mt-1">
                            SYSTEMS FORGED IN FIRE. CHECK EXISTING SYSTEMS CREATED BY INDRADEV_ OR CREATE YOURS TOGETHER WITH DEV_
                        </p>
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
                    {/* Project X (Hero) - REDESIGNED */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1 border-2 border-dashed border-[var(--accent-emerald-500)] rounded-lg p-6 flex flex-col justify-center items-center text-center bg-[var(--accent-emerald-500)]/5 hover:bg-[var(--accent-emerald-500)]/10 transition-colors group">
                        <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                             <span className="text-3xl text-[var(--accent-emerald-500)] animate-pulse">+</span>
                        </div>
                        <h3 className="font-display text-2xl text-[var(--text-primary)] mb-1">PROJECT X</h3>
                        <p className="font-mono text-xs text-[var(--accent-emerald-500)] tracking-widest mb-6">YOUR NEXT BIG THING</p>
                        
                        <div className="w-full space-y-3">
                            {/* OPTION 1: CLASSICAL SPEC */}
                            <button 
                                onClick={onOpenCalendar}
                                className="w-full py-3 px-4 bg-[var(--bg-surface)] border border-[var(--line-soft)] text-[var(--text-secondary)] font-mono text-xs hover:border-[var(--accent-topaz-500)] hover:text-[var(--accent-topaz-500)] transition-all flex flex-col items-center gap-1 group/btn"
                            >
                                <span className="font-bold tracking-wider group-hover/btn:text-[var(--text-primary)]">📋 CLASSICAL SPEC</span>
                                <span className="text-[9px] opacity-70">Have a plan? Cost estimate & build.</span>
                            </button>

                            <div className="flex items-center gap-2 opacity-50">
                                <div className="h-[1px] bg-[var(--line-soft)] flex-1"></div>
                                <span className="text-[9px] font-mono text-[var(--text-muted)]">OR</span>
                                <div className="h-[1px] bg-[var(--line-soft)] flex-1"></div>
                            </div>

                            {/* OPTION 2: GAME MODE */}
                            <button 
                                onClick={onStartGame}
                                className="w-full py-3 px-4 bg-[var(--accent-emerald-500)] text-[var(--bg-void)] font-display font-bold text-lg hover:bg-[var(--accent-emerald-700)] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                            >
                                🎮 ENTER GAME MODE
                            </button>
                        </div>
                        
                        <p className="text-[9px] text-[var(--text-muted)] mt-4 font-mono">
                            Experimentation Required.
                        </p>
                    </div>

                    {PROJECTS.map((p, i) => (
                        <div key={i} className={`border rounded-lg bg-[var(--bg-surface)] p-6 hover:shadow-[var(--shadow-glow-amethyst)] transition-all group flex flex-col relative overflow-hidden ${p.isRaidWin ? 'border-[var(--accent-topaz-500)] shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-[var(--border-soft)] hover:border-[var(--border-glow)]'}`}>
                            
                            {p.isRaidWin && (
                                <div className="absolute top-0 right-0 bg-[var(--accent-topaz-500)] text-[var(--text-inverse)] text-[9px] font-bold font-mono px-2 py-1 tracking-widest">
                                    🏆 RAID WIN
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <h3 className={`font-display text-2xl transition-colors ${p.isRaidWin ? 'text-[var(--accent-topaz-500)]' : 'text-[var(--text-primary)] group-hover:text-[var(--accent-amethyst-500)]'}`}>
                                    {p.title}
                                </h3>
                                <div className="flex gap-2">
                                    {p.links.site && (
                                        <a href={getSafeLink(p.links.site)} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent-sapphire-500)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                        </a>
                                    )}
                                    <a href={getSafeLink(p.links.github)} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent-sapphire-500)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                    </a>
                                </div>
                            </div>

                            <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1">
                                {p.desc}
                            </p>

                            {p.scientificDiscovery && (
                                <div className="mb-4 p-3 bg-[var(--accent-amethyst-500)]/5 border border-[var(--accent-amethyst-500)]/30 rounded">
                                    <span className="block text-[9px] font-mono text-[var(--accent-amethyst-500)] mb-1 uppercase tracking-wider">SCIENTIFIC BREAKTHROUGH</span>
                                    <span className="font-mono text-xs text-[var(--text-primary)] italic">"{p.scientificDiscovery}"</span>
                                </div>
                            )}

                            <div className="mb-4 p-3 bg-[var(--bg-void)]/50 rounded border border-[var(--line-soft)]">
                                <span className="block text-[10px] font-mono text-[var(--text-muted)] mb-1 uppercase tracking-wider">CREDITS</span>
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
                                {p.isInvestable && p.pitchDeck ? (
                                    <button 
                                        onClick={() => setSelectedDeck({title: p.title, content: p.pitchDeck!, id: p.id})}
                                        className="w-full py-2 border border-[var(--accent-emerald-500)] text-[var(--accent-emerald-500)] bg-[var(--accent-emerald-500)]/5 rounded text-xs font-mono font-bold hover:bg-[var(--accent-emerald-500)] hover:text-[var(--bg-void)] transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                    >
                                        <span>💎</span> VIEW PITCH DECK & INVEST
                                    </button>
                                ) : (
                                    <button 
                                        onClick={onOpenCalendar}
                                        className="w-full py-2 border border-[var(--line-soft)] rounded text-xs font-mono text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-white transition-all flex items-center justify-center gap-2 group-hover:border-[var(--border-glow)]"
                                    >
                                         <span className="text-[var(--accent-topaz-500)]">{">_"}</span> BUILD SIMILAR
                                    </button>
                                )}
                                
                                {p.isInvestable ? (
                                    <div className="flex justify-between mt-1 px-1">
                                         <span className="text-[9px] font-mono text-[var(--accent-emerald-500)]">OPEN ROUND</span>
                                         <span className="text-[9px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                                            <span>⚡</span> PERMISSIONLESS
                                         </span>
                                    </div>
                                ) : (
                                    <div className="flex justify-between mt-1 px-1">
                                        {p.investment ? (
                                            <>
                                                <span className="text-[9px] font-mono text-[var(--text-muted)]">INVESTMENT: {p.investment.cost}</span>
                                                <span className="text-[9px] font-mono text-[var(--text-muted)]">TIME: {p.investment.hours}h</span>
                                            </>
                                        ) : (
                                            <span className="text-[9px] font-mono text-[var(--text-muted)]">EST. COST: ~€2,500</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SystemArchive;

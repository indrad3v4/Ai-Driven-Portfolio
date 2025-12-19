/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Manifesto Section: The Core Philosophy
 * Structure: Left (Beliefs) | Right (Methodology/Correctly)
 * Aligned with AMBIKA 8-Step System logic.
 */

import React, { useEffect, useState } from 'react';
import { generateOrganizationSchema, injectJsonLd } from '../lib/seo';
import { getTrendingAIKeywords } from '../services/gemini';

interface ManifestoSectionProps {
  showFullManifesto?: boolean; // Kept for interface compatibility, though this design is intended for full view
  onAction?: () => void;
}

const MANIFESTO_DATA = {
  title: "INDRADEVA MANIFESTO",
  left: {
    title: "MANIFESTO",
    header: "Systems solve problems. AI systems that *scale your insight* are the future of brand, product, and organizational growth.",
    beliefs: [
      { id: 1, text: "**Belief 1:** Your core message is hidden until you see it through a system. Not a tool. A system." },
      { id: 2, text: "**Belief 2:** Speed is not just fast delivery. Speed is clarity first, then execution. Clarity kills scope creep." },
      { id: 3, text: "**Belief 3:** Every brand has an insight underneath their goal. We architect systems that turn insight into competitive edge." },
      { id: 4, text: "**Belief 4:** AI is not magic. It's a neural interface you control. Custom agents that work *now*, not promises." }
    ]
  },
  right: {
    title: "CORRECTLY",
    whatIDo: [
      "Architect AI systems that scale your insight to any audience",
      "Connect strategy (your north star) to creation (working agents) via TRIZ methodology",
      "Use self-orchestrating workflows: agents that coordinate without overhead",
      "Deliver in sprints: architecture → code → production in 2–4 weeks"
    ],
    whatIDont: [
      "Long consultations that never ship (analysis paralysis)",
      "Generic templates or \"plug-and-play\" solutions",
      "Vague promises like \"AI will solve it\" (it won't, unless designed right)",
      "Long projects without checkpoint releases and learning loops"
    ],
    howIWork: {
      intro: "8-Step System (not guesswork):",
      steps: [
        "1. Extract your insight (what you really need)",
        "2. Model the contradiction (what blocks you)",
        "3. Design the solution (using TRIZ algorithms)",
        "4. Estimate cost & timeline (realistic)",
        "5. Build the system (agent orchestration)",
        "6. Test and iterate (feedback loops)",
        "7. Deploy and monitor",
        "8. Optimize and scale"
      ],
      outro: "No step skipped. Clarity before code."
    }
  }
};

export const ManifestoSection: React.FC<ManifestoSectionProps> = ({
  onAction
}) => {
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>(['AI Systems', 'TRIZ', 'Ambika', 'Neural Link']);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);

  // 1. SEO Injection - Updated contact email
  useEffect(() => {
    const orgSchema = generateOrganizationSchema({
        name: 'Indra-AI',
        description: MANIFESTO_DATA.left.header,
        url: window.location.origin,
        foundingDate: '2024',
        email: '1ndradev4@proton.me'
    });
    
    injectJsonLd(orgSchema, 'manifesto-schema');
  }, []);

  // 2. Dynamic Trend Injection
  useEffect(() => {
    let isMounted = true;
    const fetchLiveTrends = async () => {
      try {
        const liveTrends = await getTrendingAIKeywords();
        if (isMounted && liveTrends && liveTrends.length > 0) {
          setTrendingKeywords(liveTrends.slice(0, 5));
        }
      } catch (e) {
        // Fallback silently
      } finally {
        if (isMounted) setIsLoadingTrends(false);
      }
    };
    fetchLiveTrends();
    return () => { isMounted = false; };
  }, []);

  const renderBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-[var(--accent-amethyst-500)] font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
             return <em key={i} className="text-[var(--text-primary)] not-italic border-b border-[var(--accent-emerald-500)]">{part.slice(1, -1)}</em>;
        }
        return part;
    });
  };

  return (
    <section className="w-full h-full bg-[var(--bg-void)] text-[var(--text-primary)] overflow-y-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          
          {/* TITLE */}
          <div className="text-center mb-12">
             <h1 className="font-display text-4xl md:text-6xl text-[var(--accent-topaz-500)] tracking-widest uppercase mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                {MANIFESTO_DATA.title}
            </h1>
            <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] w-12 bg-[var(--line-soft)]"></div>
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em]">
                    SYSTEM ARCHITECTURE v1.0
                </div>
                <div className="h-[1px] w-12 bg-[var(--line-soft)]"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">

            {/* --- LEFT: MANIFESTO (BELIEFS) --- */}
            <div className="bg-[var(--bg-surface)]/30 border border-[var(--line-soft)] rounded-[var(--radius-lg)] p-6 md:p-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-amethyst-500)]"></div>
                
                <h2 className="font-display text-3xl text-[var(--text-primary)] mb-6 pb-4 border-b border-[var(--line-soft)] uppercase tracking-wider">
                    {MANIFESTO_DATA.left.title}
                </h2>
                
                <p className="font-body text-lg md:text-xl text-[var(--text-secondary)] italic mb-8 leading-relaxed">
                    {renderBold(MANIFESTO_DATA.left.header)}
                </p>

                <div className="space-y-6">
                    {MANIFESTO_DATA.left.beliefs.map((b) => (
                        <div key={b.id} className="pl-4 border-l-2 border-[var(--accent-amethyst-500)]/50 hover:border-[var(--accent-amethyst-500)] transition-colors">
                            <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
                                {renderBold(b.text)}
                            </p>
                        </div>
                    ))}
                </div>
                
                {/* Background Decoration */}
                <div className="absolute -bottom-10 -right-10 text-[10rem] opacity-5 pointer-events-none select-none text-[var(--accent-amethyst-500)]">
                    ⚡
                </div>
            </div>

            {/* --- RIGHT: CORRECTLY (METHODOLOGY) --- */}
            <div className="bg-[var(--bg-surface)]/30 border border-[var(--line-soft)] rounded-[var(--radius-lg)] p-6 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-[var(--accent-emerald-500)]"></div>

                <h2 className="font-display text-3xl text-[var(--text-primary)] mb-6 pb-4 border-b border-[var(--line-soft)] uppercase tracking-wider">
                    {MANIFESTO_DATA.right.title}
                </h2>

                <div className="space-y-8">
                    
                    {/* WHAT I DO */}
                    <div className="space-y-3">
                        <h3 className="font-mono text-xs font-bold text-[var(--accent-emerald-500)] uppercase tracking-widest flex items-center gap-2">
                            <span>✓</span> WHAT I DO
                        </h3>
                        <ul className="space-y-2">
                            {MANIFESTO_DATA.right.whatIDo.map((item, i) => (
                                <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                    <span className="text-[var(--accent-emerald-500)] font-bold mt-[1px]">→</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* WHAT I DONT DO */}
                    <div className="space-y-3">
                        <h3 className="font-mono text-xs font-bold text-[var(--accent-ruby-500)] uppercase tracking-widest flex items-center gap-2">
                            <span>✗</span> WHAT I DON'T DO
                        </h3>
                        <ul className="space-y-2">
                            {MANIFESTO_DATA.right.whatIDont.map((item, i) => (
                                <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                    <span className="text-[var(--accent-ruby-500)] font-bold mt-[1px]">×</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* HOW I WORK */}
                    <div className="bg-[var(--bg-void)] border border-[var(--line-soft)] p-4 rounded">
                        <h3 className="font-mono text-xs font-bold text-[var(--accent-sapphire-500)] uppercase tracking-widest mb-3">
                            ⚙ {MANIFESTO_DATA.right.howIWork.intro}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                            {MANIFESTO_DATA.right.howIWork.steps.map((step, i) => (
                                <div key={i} className="text-[10px] md:text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                    {step}
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 pt-2 border-t border-[var(--line-soft)] text-[10px] font-mono text-[var(--accent-sapphire-500)] text-center tracking-widest uppercase">
                            {MANIFESTO_DATA.right.howIWork.outro}
                        </div>
                    </div>

                </div>
            </div>

          </div>

          {/* --- FOOTER: LIVE INTELLIGENCE & CTA --- */}
          <div className="mt-12 md:mt-16 flex flex-col items-center gap-8">
             
             {/* Keyword Stream */}
             <div className="w-full overflow-hidden relative">
                <div className="flex items-center justify-center gap-2 mb-2 opacity-70">
                    <span className={`w-1.5 h-1.5 rounded-full ${isLoadingTrends ? 'bg-yellow-500 animate-ping' : 'bg-[var(--accent-emerald-500)]'}`}></span>
                    <span className="font-mono text-[9px] text-[var(--text-muted)] tracking-widest uppercase">
                        LIVE INTELLIGENCE STREAM
                    </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {trendingKeywords.map((k, i) => (
                        <span key={i} className="px-2 py-1 bg-[var(--bg-surface)] border border-[var(--line-soft)] rounded text-[10px] font-mono text-[var(--accent-sapphire-500)]">
                            {k}
                        </span>
                    ))}
                </div>
             </div>

             {/* MAIN ACTION */}
             <div className="w-full max-w-md">
                 <button 
                    onClick={onAction}
                    className="w-full py-4 bg-[var(--accent-amethyst-500)] text-white font-display text-2xl tracking-[0.2em] rounded shadow-[0_0_30px_rgba(157,78,221,0.4)] hover:scale-105 transition-transform hover:shadow-[0_0_50px_rgba(157,78,221,0.6)] animate-pulse"
                 >
                    ARCHITECT YOUR SYSTEM {'>'}
                 </button>
                 <p className="text-center font-mono text-[9px] text-[var(--text-muted)] mt-2">
                     INITIATE AMBIKA PROTOCOL • NO COST TO START
                 </p>
             </div>

          </div>

        </div>
    </section>
  );
};

export default ManifestoSection;
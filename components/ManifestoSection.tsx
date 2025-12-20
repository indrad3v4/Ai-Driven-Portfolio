
/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Manifesto Section: The Core Philosophy
 * Structure: Left (Beliefs) | Right (Methodology/Correctly)
 */

import React, { useEffect, useState } from 'react';
import { generateOrganizationSchema, injectJsonLd } from '../lib/seo';
import { getTrendingAIKeywords } from '../services/gemini';

interface ManifestoSectionProps {
  showFullManifesto?: boolean; 
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

const SOCIALS = [
    { name: "Twitter", url: "https://x.com/indradev4love", svg: <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/> },
    { name: "GitHub", url: "https://github.com/indrad3v4", svg: <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/> },
    { name: "HuggingFace", url: "https://huggingface.co/indradeva", svg: <g transform="scale(0.046875 0.046875)"><path d="M410.7 122.4c-47.5-62.5-121.2-62.5-168.7 0-47.5-62.5-121.2-62.5-168.7 0-47.5 62.5-47.5 163.9 0 226.4L242 485c22.1 22.1 57.9 22.1 80 0l168.7-136.2c47.5-62.5 47.5-163.9 0-226.4z" fill="#FFD21E"/><path d="M125 180c0 13.8 11.2 25 25 25s25-11.2 25-25-11.2-25-25-25-25 11.2-25 25zm220 0c0 13.8 11.2 25 25 25s25-11.2 25-25-11.2-25-25-25-25 11.2-25 25z" fill="#000"/><path d="M210 280c0 44.2 44.8 80 100 80s100-35.8 100-80H210z" fill="#000"/></g> },
    { name: "Discord", url: "https://discord.com", svg: <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.666 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/> },
    { name: "Telegram", url: "https://t.me/indra_dev4", svg: <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zM17.07 8.13c-.15 1.58-.8 5.42-1.13 7.19c-.14.75-.42 1-.68 1.03c-.58.05-1.02-.38-1.58-.75c-.88-.58-1.38-.94-2.23-1.5c-.99-.65-.35-1.01.22-1.59c.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02c-.09.02-1.49.95-4.22 2.79c-.4.27-.76.41-1.08.4c-.36-.01-1.04-.2-1.55-.37c-.63-.2-1.13-.31-1.08-.66c.02-.18.27-.36.74-.55c2.91-1.27 4.85-2.11 5.83-2.51c2.78-1.16 3.35-1.36 3.73-1.36c.08 0 .27.02.39.12c.1.08.13.19.14.27c-.01.06.01.24 0 .38z"/> },
];

export const ManifestoSection: React.FC<ManifestoSectionProps> = ({
  onAction
}) => {
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>(['AI SYSTEMS', 'TRIZ', 'AMBIKA', 'NEURAL LINK', 'AGENTIC WORKFLOWS']);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);

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

  useEffect(() => {
    let isMounted = true;
    const fetchLiveTrends = async () => {
      try {
        const liveTrends = await getTrendingAIKeywords();
        if (isMounted && liveTrends && liveTrends.length > 0) {
          setTrendingKeywords(liveTrends);
        }
      } catch (e) {
        console.error("Failed to fetch live trends", e);
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
            <div className="bg-[var(--bg-surface)]/30 border border-[var(--line-soft)] rounded-[var(--radius-lg)] p-6 md:p-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-amethyst-500)]"></div>
                <h2 className="font-display text-3xl text-[var(--text-primary)] mb-6 pb-4 border-b border-[var(--line-soft)] uppercase tracking-wider">{MANIFESTO_DATA.left.title}</h2>
                <p className="font-body text-lg md:text-xl text-[var(--text-secondary)] italic mb-8 leading-relaxed">{renderBold(MANIFESTO_DATA.left.header)}</p>
                <div className="space-y-6">
                    {MANIFESTO_DATA.left.beliefs.map((b) => (
                        <div key={b.id} className="pl-4 border-l-2 border-[var(--accent-amethyst-500)]/50 hover:border-[var(--accent-amethyst-500)] transition-colors">
                            <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">{renderBold(b.text)}</p>
                        </div>
                    ))}
                </div>
                <div className="absolute -bottom-10 -right-10 text-[10rem] opacity-5 pointer-events-none select-none text-[var(--accent-amethyst-500)]">⚡</div>
            </div>

            <div className="bg-[var(--bg-surface)]/30 border border-[var(--line-soft)] rounded-[var(--radius-lg)] p-6 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-[var(--accent-emerald-500)]"></div>
                <h2 className="font-display text-3xl text-[var(--text-primary)] mb-6 pb-4 border-b border-[var(--line-soft)] uppercase tracking-wider">{MANIFESTO_DATA.right.title}</h2>
                <div className="space-y-8">
                    <div className="space-y-3">
                        <h3 className="font-mono text-xs font-bold text-[var(--accent-emerald-500)] uppercase tracking-widest flex items-center gap-2"><span>✓</span> WHAT I DO</h3>
                        <ul className="space-y-2">
                            {MANIFESTO_DATA.right.whatIDo.map((item, i) => (
                                <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                    <span className="text-[var(--accent-emerald-500)] font-bold mt-[1px]">→</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-mono text-xs font-bold text-[var(--accent-ruby-500)] uppercase tracking-widest flex items-center gap-2"><span>✗</span> WHAT I DON'T DO</h3>
                        <ul className="space-y-2">
                            {MANIFESTO_DATA.right.whatIDont.map((item, i) => (
                                <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                    <span className="text-[var(--accent-ruby-500)] font-bold mt-[1px]">×</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-[var(--bg-void)] border border-[var(--line-soft)] p-4 rounded">
                        <h3 className="font-mono text-xs font-bold text-[var(--accent-sapphire-500)] uppercase tracking-widest mb-3">⚙ {MANIFESTO_DATA.right.howIWork.intro}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                            {MANIFESTO_DATA.right.howIWork.steps.map((step, i) => (
                                <div key={i} className="text-[10px] md:text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">{step}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* SOCIAL & CONNECT SECTION */}
          <div className="mt-12 p-8 border-t border-[var(--line-soft)] bg-[var(--bg-surface)]/20 rounded-xl flex flex-col items-center gap-6">
              <h3 className="font-display text-2xl tracking-widest text-[var(--accent-emerald-500)] uppercase">Establish Connection</h3>
              <div className="flex flex-wrap justify-center gap-6">
                  {SOCIALS.map(s => (
                      <a 
                        key={s.name} 
                        href={s.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-10 h-10 flex items-center justify-center bg-[var(--bg-void)] border border-[var(--line-soft)] rounded-lg hover:border-[var(--accent-emerald-500)] hover:scale-110 transition-all group p-2 overflow-hidden"
                        title={s.name}
                      >
                          <svg viewBox="0 0 24 24" fill="currentColor" className={`w-full h-full ${s.name === 'HuggingFace' ? 'text-inherit' : 'text-[var(--text-muted)] group-hover:text-[var(--accent-emerald-500)]'} transition-colors`}>
                              {s.svg}
                          </svg>
                      </a>
                  ))}
              </div>
              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Available on all tactical frequencies</p>
          </div>

          <div className="mt-12 flex flex-col items-center gap-8">
             <div className="w-full overflow-hidden relative">
                <div className="flex items-center justify-center gap-2 mb-2 opacity-70">
                    <span className={`w-1.5 h-1.5 rounded-full ${isLoadingTrends ? 'bg-yellow-500 animate-ping' : 'bg-[var(--accent-emerald-500)]'}`}></span>
                    <span className="font-mono text-[9px] text-[var(--text-muted)] tracking-widest uppercase">LIVE INTELLIGENCE STREAM</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {trendingKeywords.map((k, i) => (
                        <span key={i} className="px-2 py-1 bg-[var(--bg-surface)] border border-[var(--line-soft)] rounded text-[10px] font-mono text-[var(--accent-sapphire-500)] animate-in fade-in zoom-in-90 duration-300 shadow-sm" style={{ animationDelay: `${i * 100}ms` }}>{k}</span>
                    ))}
                </div>
             </div>
             <div className="w-full max-w-md">
                 <button 
                    onClick={onAction}
                    className="w-full py-4 bg-[var(--accent-amethyst-500)] text-white font-display text-2xl tracking-[0.2em] rounded shadow-[0_0_30px_rgba(157,78,221,0.4)] hover:scale-105 transition-transform hover:shadow-[0_0_50px_rgba(157,78,221,0.6)] animate-pulse"
                 >
                    ARCHITECT YOUR SYSTEM {'>'}
                 </button>
             </div>
          </div>
        </div>
    </section>
  );
};

export default ManifestoSection;

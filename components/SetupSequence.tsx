
import React, { useState, useEffect } from 'react';

interface Props {
  stage: 'DISCLAIMER' | 'PORTFOLIO' | 'READY';
  language: 'EN' | 'PL' | 'BEL';
  onOpenArchive: () => void;
}

const COPY = {
  EN: {
    intro: "Hi, I am **indradev_** — a Python AI Engineer. 5 years forging systems in Kraków. Ready to build yours.",
    subtitle: "IN THIS SYSTEM YOU CAN:",
    actions: [
      { id: "1", title: "BUILD YOUR SYSTEM", desc: "In AI RPG. Architect your system in 8 steps (press start below)." },
      { id: "2", title: "CHECK", desc: "Live portfolio of AI systems & case studies, in right down corner." },
      { id: "3", title: "CONNECT", desc: "Read the manifesto or ping me directly. Questions? Tea in Kraków? Ping me on any frequency." }
    ],
    portfolioIntro: "RECENT CODING VICTORIES:",
    portfolioNote: "[ SYSTEM NOTE: ARCHIVE UPDATING. SOME LINKS MAY BE OFFLINE. ]",
    projects: [
        { name: "STERLING ANGELS", tag: "FINANCE_AI", result: "Real-time agentic pipeline for summarizing financial documentation. Deployed on HuggingFace." },
        { name: "MASSLOOP AI", tag: "PERFORMANCE", result: "Agentic AI system for music live performers. Live performance ready." }
    ],
    readyTitle: "TERMINAL READY",
    readyDesc: "System integrity 100%. Ambika waiting for your signal. Press Start to insert your mind into the engine."
  },
  PL: {
    intro: "Cześć, tu **indradev_** — inżynier AI z Krakowa. 5 lat w Pythonie. Gotowy zbudować Twój system.",
    subtitle: "W TYM SYSTEMIE MOŻESZ:",
    actions: [
      { id: "1", title: "ZBUDUJ SYSTEM", desc: "W RPG napędzanym AI. Zaprojektuj architekturę w 8 krokach (naciśnij start poniżej)." },
      { id: "2", title: "SPRAWDŹ", desc: "Portfolio systemów AI i case studies, w prawym dolnym rogu." },
      { id: "3", title: "POŁĄCZ SIĘ", desc: "Przeczytaj manifest lub napisz. Pytania? Herbata w Krakowie? Pisz śmiało." }
    ],
    portfolioIntro: "OSTATNIE ZWYCIĘSTWA W KODOWANIU:",
    portfolioNote: "[ SYSTEM: ARCHIWUM W TRAKCIE AKTUALIZACJI. NIEKTÓRE LINKI MOGĄ BYĆ NIEDOSTĘPNE. ]",
    projects: [
        { name: "STERLING ANGELS", tag: "FINANCE_AI", result: "Agentyczny pipeline do analizy dokumentacji finansowej. Deployed na HuggingFace." },
        { name: "MASSLOOP AI", tag: "PERFORMANCE", result: "System AI dla muzyków na żywo. Gotowy do występów." }
    ],
    readyTitle: "TERMINAL GOTOWY",
    readyDesc: "Integralność 100%. Ambika czeka na sygnał. Naciśnij Start, aby połączyć się z systemem."
  },
  BEL: {
    intro: "Прывітанне, я **indradev_** — інжынер AI з Кракава. 5 гадоў у Python. Гатовы стварыць тваю сістэму.",
    subtitle: "У ГЭТАЙ СІСТЭМЕ ТЫ МОЖАШ:",
    actions: [
      { id: "1", title: "ПАБУДУЙ СІСТЭМУ", desc: "У AI-RPG. Архітэктура ў 8 крокаў (націсні старт ніжэй)." },
      { id: "2", title: "ПРАВЕР", desc: "Жывыя AI-сістэмы і кейсы, у правым ніжнім куце." },
      { id: "3", title: "КАНТАКТ", desc: "Чытай маніфест ці пішы. Пытанні? Кава ў Кракаве? Пішы ў любы мэсэнджар." }
    ],
    portfolioIntro: "АПОШНІЯ ПЕРАМОГІ Ў КОДЗЕ:",
    portfolioNote: "[ СІСТЭМНАЯ ЗАЎВАГА: АРХІЎ АБНАЎЛЯЕЦЦА. НЕКАТОРЫЯ СПАСЫЛКІ МОГУЦЬ БЫЦЬ НЕДАСТУПНЫМІ. ]",
    projects: [
        { name: "STERLING ANGELS", tag: "FINANCE_AI", result: "Агентыўны паток для аналізу фінансавай дакументацыі. Deployed на HuggingFace." },
        { name: "MASSLOOP AI", tag: "PERFORMANCE", result: "Агентыўная сістэма для музычных перформансаў. Гатова да выступленняў." }
    ],
    readyTitle: "ТЭРМІНАЛ ГАТОВЫ",
    readyDesc: "Сістэма праверыла ўсе параметры. Ambika чакае сігналу. Націсніце Старт."
  }
};

const SetupSequence: React.FC<Props> = ({ stage, language, onOpenArchive }) => {
    const c = COPY[language];
    const [typed, setTyped] = useState('');
    const fullText = stage === 'DISCLAIMER' ? c.intro : stage === 'READY' ? c.readyDesc : '';

    useEffect(() => {
        setTyped('');
        if (!fullText) return;
        let i = 0;
        const interval = setInterval(() => {
            setTyped(prev => fullText.slice(0, i + 1));
            i++;
            if (i >= fullText.length) clearInterval(interval);
        }, 15);
        return () => clearInterval(interval);
    }, [stage, language, fullText]);

    const renderText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => 
            part.startsWith('**') 
                ? <strong key={i} className="text-[var(--accent-amethyst-500)] font-bold">{part.slice(2, -2)}</strong> 
                : part
        );
    };

    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
            
            {/* STAGE 0: DISCLAIMER */}
            {stage === 'DISCLAIMER' && (
                <div className="flex-1 flex flex-col animate-in fade-in duration-500 overflow-y-auto scrollbar-none">
                    <div className="space-y-4">
                        <p className="text-xs md:text-sm leading-relaxed text-[var(--text-primary)] font-mono min-h-[40px]">
                            {renderText(typed)}
                        </p>
                        
                        <div className="space-y-3">
                            <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest">{c.subtitle}</p>
                            <div className="grid grid-cols-1 gap-2">
                                {c.actions.map(a => (
                                    <div key={a.id} className="flex gap-3 items-start border-l-2 border-[var(--line-soft)] pl-3 py-1 bg-[var(--bg-surface)]/30 rounded-r">
                                        <span className="text-[10px] font-mono text-[var(--accent-emerald-500)] font-bold">{a.id}.</span>
                                        <div>
                                            <span className="text-[11px] font-mono text-white font-bold block uppercase">{a.title}</span>
                                            <span className="text-[10px] font-mono text-[var(--text-secondary)] leading-tight">{a.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STAGE 1: PORTFOLIO HIGHLIGHT */}
            {stage === 'PORTFOLIO' && (
                <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-500 overflow-y-auto scrollbar-none">
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-mono text-[var(--accent-topaz-500)] tracking-widest uppercase mb-1 font-bold">
                                {c.portfolioIntro}
                            </p>
                            <p className="text-[8px] font-mono text-[var(--accent-ruby-500)] opacity-70 animate-pulse">
                                {c.portfolioNote}
                            </p>
                        </div>
                        <div className="space-y-3">
                            {c.projects.map((p, i) => (
                                <div key={i} className="bg-[var(--bg-surface)] border border-[var(--line-soft)] p-3 rounded group hover:border-[var(--accent-amethyst-500)] transition-all">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="font-display text-lg text-white leading-none">{p.name}</span>
                                        <span className="text-[8px] font-mono text-[var(--accent-emerald-500)] font-bold border border-[var(--accent-emerald-500)]/30 px-1 rounded">{p.tag}</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-[var(--text-secondary)] leading-snug">
                                        {p.result}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={onOpenArchive}
                            className="text-[9px] font-mono text-[var(--accent-sapphire-500)] hover:underline flex items-center gap-1 mx-auto mt-4"
                        >
                            ⚓ VIEW FULL ARCHIVE.EXE
                        </button>
                    </div>
                </div>
            )}

            {/* STAGE 2: READY */}
            {stage === 'READY' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 border-4 border-[var(--accent-emerald-500)] rounded-full animate-pulse flex items-center justify-center">
                            <span className="text-4xl animate-bounce">⚡</span>
                        </div>
                        <div className="absolute inset-0 border border-[var(--accent-emerald-500)] rounded-full animate-ping opacity-20"></div>
                    </div>
                    <h3 className="font-display text-3xl text-[var(--accent-emerald-500)] mb-2 tracking-widest uppercase">
                        {c.readyTitle}
                    </h3>
                    <p className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed max-w-[80%] mx-auto">
                        {renderText(typed)}
                    </p>
                    <div className="mt-6 flex gap-2">
                        <div className="w-1 h-1 bg-[var(--accent-emerald-500)] animate-pulse"></div>
                        <div className="w-1 h-1 bg-[var(--accent-emerald-500)] animate-pulse delay-100"></div>
                        <div className="w-1 h-1 bg-[var(--accent-emerald-500)] animate-pulse delay-200"></div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SetupSequence;

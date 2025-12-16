
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import RetroButton from './RetroButton';

interface Props {
  onProceed: () => void;
  language: 'EN' | 'PL' | 'BEL';
  setLanguage: (l: 'EN' | 'PL' | 'BEL') => void;
}

type Language = 'EN' | 'PL' | 'BEL';

const COPY = {
  EN: {
    headline: "DISCLAIMER",
    intro: "Hi, I'm **indradev_** — a Python AI Engineer based in Kraków. With 5 years of experience in Python, I'm ready to build your system.",
    subtitle: "In my portfolio you can:",
    actions: [
      { id: "1", title: "CHECK", desc: "Live AI systems & case studies." },
      { id: "2", title: "BUILD YOUR SYSTEM", desc: "In AI-powered RPG. Architect your system in 8 steps." },
      { id: "3", title: "FILL TECH SPECS", desc: "Skip the game. Draft a tech task with AI & lock a sprint." },
      { id: "4", title: "CONNECT", desc: "Read the manifesto or ping me directly." }
    ],
    outro: "Questions? Tea in Kraków? Ping me on any frequency.",
    cta: "ENTER PORTFOLIO"
  },
  PL: {
    headline: "DISCLAIMER",
    intro: "Cześć, tu **indradev_** — inżynier AI z Krakowa. Mam 5 lat doświadczenia w Pythonie i jestem gotów zbudować Twój system.",
    subtitle: "W moim portfolio możesz:",
    actions: [
      { id: "1", title: "SPRAWDZIĆ", desc: "Działające systemy AI i case studies." },
      { id: "2", title: "ZBUDOWAĆ SYSTEM", desc: "W RPG napędzanym AI. Zaprojektuj architekturę w 8 krokach." },
      { id: "3", title: "WYPEŁNIĆ SPECYFIKACJĘ", desc: "Pomiń grę. Stwórz draft techniczny z AI i zablokuj sprint." },
      { id: "4", title: "POŁĄCZYĆ SIĘ", desc: "Przeczytaj manifest lub napisz bezpośrednio." }
    ],
    outro: "Pytania? Herbata w Krakowie? Pisz śmiało.",
    cta: "WEJDŹ DO PORTFOLIO"
  },
  BEL: {
    headline: "DISCLAIMER",
    intro: "Прывітанне, я **indradev_** — інжынер AI з Кракава. 5 гадоў у Python, гатовы пабудаваць тваю сістэму.",
    subtitle: "У маім партфоліа ты можаш:",
    actions: [
      { id: "1", title: "ПРАВЕРЫЦЬ", desc: "Жывыя AI-сістэмы і кейсы." },
      { id: "2", title: "ПАБУДАВАЦЬ СІСТЭМУ", desc: "У AI-RPG. Архітэктура ў 8 крокаў." },
      { id: "3", title: "ЗАПОЎНІЦЬ СПЕЦ", desc: "Прапусці гульню. Чарнавік з AI і бронь спрынту." },
      { id: "4", title: "КАНТАКТ", desc: "Чытай маніфест ці пішы напрамую." }
    ],
    outro: "Пытанні? Кава ў Кракаве? Пішы ў любы мэсэнджар.",
    cta: "УВАЙСЦІ Ў ПОРТФОЛІА"
  }
};

const SOCIALS = [
  { name: "Twitter", url: "https://x.com/indradev4love", icon: "🐦" },
  { name: "GitHub", url: "https://github.com/indrad3v4", icon: "💻" },
  { name: "HuggingFace", url: "https://huggingface.co/indradeva", icon: "🤗" },
  { name: "Discord", copyValue: "1ndra1506", icon: "💬" },
  { name: "Instagram", url: "https://www.instagram.com/indrad3v4", icon: "📸" },
  { name: "Telegram", url: "https://t.me/indra_dev4", icon: "✈️" },
  { name: "Reddit", url: "https://www.reddit.com/u/indradev4/s/e8ALcXbHsE", icon: "🤖" },
];

const ConnectionRequest: React.FC<Props> = ({ onProceed, language, setLanguage }) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay for entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentCopy = COPY[language];

  // Helper to render markdown-like bolding
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <span>
        {parts.map((part, i) => 
          part.startsWith('**') 
            ? <strong key={i} className="text-[var(--accent-amethyst-500)] font-bold">{part.slice(2, -2)}</strong> 
            : part
        )}
      </span>
    );
  };

  const LangButton = ({ code, icon, isActive, onClick }: { code: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center p-2 rounded min-w-[3.5rem] transition-all duration-200 border ${
        isActive 
          ? 'bg-[var(--accent-amethyst-500)] text-white border-[var(--accent-amethyst-500)] shadow-[0_0_10px_rgba(157,78,221,0.4)] scale-105' 
          : 'bg-[var(--bg-void)] text-[var(--text-muted)] border-[var(--line-soft)] hover:border-[var(--accent-amethyst-500)] hover:text-white'
      }`}
    >
      <span className="text-[10px] font-mono font-bold tracking-widest mb-1">{code}</span>
      <span className="text-lg leading-none">{icon}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-[var(--bg-void)]/90 backdrop-blur-sm p-4">
      
      <div className={`relative max-w-2xl w-full bg-[var(--bg-surface)] border-2 border-[var(--accent-amethyst-500)] shadow-[0_0_50px_rgba(157,78,221,0.2)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-500 transform ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'}`}>
        
        {/* Header Bar */}
        <div className="flex justify-between items-start md:items-center p-4 border-b border-[var(--line-soft)] bg-[var(--bg-overlay)]">
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span className="text-[var(--accent-emerald-500)] font-bold">•</span>
            <span className="font-mono text-[10px] md:text-xs text-[var(--accent-emerald-500)] tracking-widest uppercase">
              {currentCopy.headline}
            </span>
          </div>
          
          {/* Language Selector */}
          <div className="flex gap-2">
            <LangButton 
              code="EN" 
              icon="🌐" 
              isActive={language === 'EN'} 
              onClick={() => setLanguage('EN')} 
            />
            <LangButton 
              code="PL" 
              icon="🇵🇱" 
              isActive={language === 'PL'} 
              onClick={() => setLanguage('PL')} 
            />
            <LangButton 
              code="BEL" 
              icon={<span className="block w-5 h-3 border border-white/20" style={{ background: 'linear-gradient(to bottom, #ffffff 33%, #ef4444 33%, #ef4444 66%, #ffffff 66%)' }}></span>}
              isActive={language === 'BEL'} 
              onClick={() => setLanguage('BEL')} 
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[65vh] md:max-h-none scrollbar-thin">
          
          {/* Intro */}
          <div className="text-sm md:text-base leading-relaxed text-[var(--text-primary)]">
            {renderText(currentCopy.intro)}
          </div>

          <p className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
            {currentCopy.subtitle}
          </p>

          {/* Action Grid */}
          <div className="space-y-4">
            {currentCopy.actions.map((action, i) => (
              <div 
                key={i} 
                className="flex items-start gap-4 p-4 rounded border-l-2 border-[var(--accent-emerald-500)] bg-[var(--accent-emerald-500)]/5 hover:bg-[var(--accent-emerald-500)]/10 transition-colors"
              >
                <span className="font-mono font-bold text-[var(--accent-emerald-500)] text-sm pt-0.5 min-w-[1.5rem]">
                  {action.id}.
                </span>
                <div className="flex flex-col gap-1">
                  <span className="font-display font-bold text-sm tracking-wide text-[var(--text-primary)]">
                    {action.title}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono leading-tight">
                    {action.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Outro */}
          <p className="text-xs md:text-sm text-[var(--text-muted)] italic pt-2">
            {currentCopy.outro}
          </p>

          {/* Social Grid */}
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2 pt-4 border-t border-[var(--line-soft)]">
             {SOCIALS.map((s, i) => {
               if (s.copyValue) {
                 return (
                   <button 
                     key={i}
                     onClick={() => handleCopy(s.copyValue!)}
                     className="flex flex-col items-center justify-center p-2 rounded bg-[var(--bg-void)] hover:bg-[var(--accent-amethyst-500)] hover:text-white transition-all group relative"
                     title={`Copy ${s.name}: ${s.copyValue}`}
                   >
                     <span className="text-xl mb-1 filter grayscale group-hover:grayscale-0">{s.icon}</span>
                     {copied && s.name === "Discord" ? (
                       <span className="absolute -top-2 bg-[var(--accent-emerald-500)] text-black text-[8px] px-1 rounded">COPIED</span>
                     ) : (
                       <span className="text-[8px] font-mono uppercase opacity-70 group-hover:opacity-100">{s.name}</span>
                     )}
                   </button>
                 )
               }
               return (
                 <a 
                   key={i}
                   href={s.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex flex-col items-center justify-center p-2 rounded bg-[var(--bg-void)] hover:bg-[var(--accent-amethyst-500)] hover:text-white transition-all group"
                 >
                   <span className="text-xl mb-1 filter grayscale group-hover:grayscale-0">{s.icon}</span>
                   <span className="text-[8px] font-mono uppercase opacity-70 group-hover:opacity-100">{s.name}</span>
                 </a>
               );
             })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-[var(--bg-overlay)] border-t border-[var(--line-soft)]">
          <RetroButton 
            onClick={onProceed} 
            variant="accent" 
            className="w-full text-center py-4 text-xl tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse hover:animate-none"
          >
            {currentCopy.cta}
          </RetroButton>
        </div>

      </div>
    </div>
  );
};

export default ConnectionRequest;

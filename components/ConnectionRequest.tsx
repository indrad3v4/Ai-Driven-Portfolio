
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import RetroButton from './RetroButton';

interface Props {
  onProceed: () => void;
}

type Language = 'EN' | 'PL' | 'BE';

const COPY = {
  EN: {
    headline: "INCOMING CONNECTION REQUEST...",
    intro: "Hi, I'm **indradev_**. I'm a Python AI Engineer with 5+ years of experience, currently based in Kraków. You are seeing this interactive portfolio because I am open to new projects.",
    bullets: [
      { label: "TOP SECTOR", text: "Fill out a technical task with AI to generate a draft, then book time to discuss it. I will code it for you." },
      { label: "CORE SECTOR", text: "Play the game to find inspiration or look at your goals from a new perspective." },
      { label: "ARCHIVE", text: "Scroll down to find my manifesto and a collection of live AI/ML/DL systems and agents." }
    ],
    outro: "If you have questions or want to meet in Kraków for tea, ping me on any frequency below.",
    cta: "INITIALIZE LINK"
  },
  PL: {
    headline: "PRZYCHODZĄCE POŁĄCZENIE...",
    intro: "Cześć, tu **indradev_**. Jestem inżynierem AI (Python) z ponad 5-letnim doświadczeniem, obecnie mieszkam w Krakowie. Widzisz to interaktywne portfolio, ponieważ jestem otwarty na nowe projekty.",
    bullets: [
      { label: "GÓRA", text: "Opisz swoje zadanie techniczne przy pomocy AI, odbierz wstępny projekt i umów się na rozmowę. Zakoduję to dla Ciebie." },
      { label: "ŚRODEK", text: "Zagraj w grę, aby znaleźć inspirację lub spojrzeć na swoje cele z innej perspektywy." },
      { label: "DÓŁ", text: "Mój manifest oraz baza działających modeli i agentów AI/ML/DL." }
    ],
    outro: "Jeśli masz pytania lub chcesz wyskoczyć na herbatę w Krakowie – napisz do mnie na dowolnym kanale poniżej.",
    cta: "INICJUJ POŁĄCZENIE"
  },
  BE: {
    headline: "ЗАПЫТ НА ЗЛУЧЭННЕ...",
    intro: "Прывітанне, я **indradev_**. Я Python AI інжынер з больш чым 5-гадовым досведам, зараз жыву ў Кракаве. Гэта маё інтэрактыўнае партфоліо, і вы бачыце яго, бо я адкрыты да новых праектаў.",
    bullets: [
      { label: "ЗВЕРХУ", text: "Апішыце сваю тэхнічную задачу з дапамогай ШІ, атрымайце чарнавік і забраніруйце час для абмеркавання. Я напішу гэты код для вас." },
      { label: "У ЦЭНТРЫ", text: "Згуляйце ў гульню, каб знайсці натхненне ці паглядзець на свае мэты пад іншым вуглом." },
      { label: "ЗНІЗУ", text: "Мой маніфест і калекцыя рэальных AI/ML/DL сістэм і агентаў." }
    ],
    outro: "Калі ў вас ёсць пытанні ці вы хочаце сустрэцца на гарбату ў Кракаве — пішыце мне ў любы месенджар ніжэй.",
    cta: "УВАЙСЦІ Ў СІСТЭМУ"
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

const ConnectionRequest: React.FC<Props> = ({ onProceed }) => {
  const [lang, setLang] = useState<Language>('EN');
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

  const currentCopy = COPY[lang];

  // Helper to render markdown-like bolding
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => 
      part.startsWith('**') 
        ? <strong key={i} className="text-[var(--accent-amethyst-500)] font-normal">{part.slice(2, -2)}</strong> 
        : part
    );
  };

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-[var(--bg-void)] p-4">
      {/* Background Matrix/Grid Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(rgba(157, 78, 221, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(157, 78, 221, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className={`relative max-w-2xl w-full bg-[var(--bg-surface)]/80 backdrop-blur-xl border border-[var(--accent-amethyst-500)] shadow-[0_0_50px_rgba(157,78,221,0.2)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-700 transform ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'}`}>
        
        {/* Header Bar */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--line-soft)] bg-[var(--bg-overlay)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-emerald-500)] animate-pulse"></div>
            <span className="font-mono text-[10px] md:text-xs text-[var(--accent-emerald-500)] tracking-widest uppercase">
              {currentCopy.headline}
            </span>
          </div>
          
          {/* Language Selector */}
          <div className="flex gap-2">
            <button onClick={() => setLang('EN')} className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${lang === 'EN' ? 'bg-[var(--accent-amethyst-500)] text-white' : 'text-[var(--text-muted)] hover:text-white'}`}>EN 🌐</button>
            <button onClick={() => setLang('PL')} className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${lang === 'PL' ? 'bg-[var(--accent-amethyst-500)] text-white' : 'text-[var(--text-muted)] hover:text-white'}`}>PL 🇵🇱</button>
            <button onClick={() => setLang('BE')} className={`px-2 py-1 rounded text-[10px] font-mono transition-all flex items-center gap-1 ${lang === 'BE' ? 'bg-[var(--accent-amethyst-500)] text-white' : 'text-[var(--text-muted)] hover:text-white'}`}>
              BE 
              <span className="block w-4 h-2.5 border border-white/20" style={{ background: 'linear-gradient(to bottom, #ffffff 33%, #ef4444 33%, #ef4444 66%, #ffffff 66%)' }}></span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[60vh] md:max-h-none scrollbar-thin">
          
          {/* Intro */}
          <p className="text-sm md:text-base leading-relaxed text-[var(--text-primary)]">
            {renderText(currentCopy.intro)}
          </p>

          {/* Bullets */}
          <div className="space-y-3 pl-4 border-l-2 border-[var(--line-soft)]">
            {currentCopy.bullets.map((b, i) => (
              <div key={i} className="text-xs md:text-sm">
                <span className="text-[var(--accent-topaz-500)] font-bold tracking-wider block mb-1">{b.label}</span>
                <span className="text-[var(--text-secondary)]">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Outro */}
          <p className="text-xs md:text-sm text-[var(--text-muted)] italic">
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

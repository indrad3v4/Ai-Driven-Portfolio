
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
    intro: "Hi, I'm **indradev_** — a Python AI Engineer with 5+ years of experience, based in Kraków. This is my interactive portfolio. Welcome to the experience.\n\n**Here's what you can do:**",
    bullets: [
      { label: "1. ENTER PORTFOLIO", text: "Explore my collection of live AI/ML/DL systems and agents. Maybe your next project will be built here with me." },
      { label: "2. PRESS START", text: "Play an AI-powered brainstorming game — like an MMORPG raid where you refine your vision with a swarm of agents. Find inspiration or see your goals from a fresh perspective." },
      { label: "3. TECHNICAL MANIFESTO", text: "Have an existing system or task? Click \"Fill Technical Task\" in the header. My AI agent will help you draft a technical specification. We'll discuss it together at a scheduled time, and I'll code it for you." },
      { label: "4. ARCHIVE", text: "Scroll down to explore my manifesto and a growing collection of live AI/ML/DL systems and agents." }
    ],
    outro: "If you have questions or want to meet in Kraków for tea, ping me on any frequency below.",
    cta: "ENTER PORTFOLIO"
  },
  PL: {
    headline: "DISCLAIMER",
    intro: "Cześć, jestem **indradev_** — inżynier Python AI z ponad 5 latami doświadczenia, pracuję z Krakowa. To jest moje interaktywne portfolio. Witaj w doświadczeniu.\n\n**Oto, co możesz zrobić:**",
    bullets: [
      { label: "1. WEJDŹ DO PORTFOLIO", text: "Poznaj moją kolekcję żywych systemów AI/ML/DL i agentów. Może Twój następny projekt powstanie tutaj razem ze mną." },
      { label: "2. NACIŚNIJ START", text: "Zagraj w grę brainstormingową napędzaną sztuczną inteligencją — jak rajd MMORPG, gdzie ulepszasz swoją wizję za pomocą roju agentów. Znajdź inspirację lub spójrz na swoje cele z nowej perspektywy." },
      { label: "3. MANIFEST TECHNICZNY", text: "Masz istniejący system lub zadanie? Kliknij \"Wypełnij Zadanie Techniczne\" w nagłówku. Mój agent AI pomoże Ci sporządzić specyfikację techniczną. Omowimy ją razem w wybranym czasie, a ja napiszę kod dla Ciebie." },
      { label: "4. ARCHIWUM", text: "Przewiń w dół, aby zapoznać się z moim manifestem i rosnącą kolekcją żywych systemów AI/ML/DL oraz agentów." }
    ],
    outro: "Jeśli masz pytania lub chcesz wyskoczyć na herbatę w Krakowie – napisz do mnie na dowolnym kanale poniżej.",
    cta: "WEJDŹ DO PORTFOLIO"
  },
  BEL: {
    headline: "DISCLAIMER",
    intro: "Прывітанне, я **indradev_** — інженер Python AI з больш як 5 гадамі досведу, базіруюся ў Кракаве. Гэта маё інтэрактыўнае портфоліа. Вітаю!\n\n**Вось што ты можаш зрабіць:**",
    bullets: [
      { label: "1. УВАХОД Ў ПОРТФОЛІА", text: "Даследуй мою калекцыю жывых сістэм AI/ML/DL і агентаў. Можа, твой наступны праект будзе створаны тут разам са мной." },
      { label: "2. НАПІШ START", text: "Гуляй у гульню мозгавога штурму на базе штучнага інтэлекту — як рэйд у MMORPG, дзе ты раздьмухваеш сваю візію з дапамогай роя агентаў. Знайдзі натхненне ці паглядзі на свае мэты ў новым свеце." },
      { label: "3. ТЭХНІЧНЫ МАНІФЕСТ", text: "У цябе ёсць наяўная сістэма ці задача? Клікні \"Запоўніць Тэхнічнае Заданне\" ў хэдаре. Мой агент AI дапаможа табе скласці тэхнічную спецыфікацыю. А пасля мы абмяркуем яе разам ва выбраны час, і я напішу код для цябе." },
      { label: "4. АРХІЎ", text: "Скроль вніз, каб даследаваць мой маніфест і растучую кольекцыю жывых сістэм AI/ML/DL і агентаў." }
    ],
    outro: "Калі ў цябе ёсць пытанні ці жадаеш сустрэцца на каву ў Кракаве — напішы мне ў адным з месенджараў ніжэй.",
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

  // Helper to render markdown-like bolding and newlines
  const renderText = (text: string) => {
    // Split by newlines first to handle paragraphs
    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={lineIdx} className="block min-h-[1em]">
          {parts.map((part, i) => 
            part.startsWith('**') 
              ? <strong key={i} className="text-[var(--accent-amethyst-500)] font-normal">{part.slice(2, -2)}</strong> 
              : part
          )}
        </span>
      );
    });
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
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-[var(--bg-void)] p-4">
      {/* Background Matrix/Grid Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(rgba(157, 78, 221, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(157, 78, 221, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className={`relative max-w-2xl w-full bg-[var(--bg-surface)]/80 backdrop-blur-xl border border-[var(--accent-amethyst-500)] shadow-[0_0_50px_rgba(157,78,221,0.2)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-700 transform ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'}`}>
        
        {/* Header Bar */}
        <div className="flex justify-between items-start md:items-center p-4 border-b border-[var(--line-soft)] bg-[var(--bg-overlay)]">
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-emerald-500)] animate-pulse"></div>
            <span className="font-mono text-[10px] md:text-xs text-[var(--accent-emerald-500)] tracking-widest uppercase">
              {currentCopy.headline}
            </span>
          </div>
          
          {/* Language Selector - Vertical Stack Style */}
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
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[60vh] md:max-h-none scrollbar-thin">
          
          {/* Intro */}
          <div className="text-sm md:text-base leading-relaxed text-[var(--text-primary)]">
            {renderText(currentCopy.intro)}
          </div>

          {/* Bullets (4 Steps) */}
          <div className="space-y-4 pl-4 border-l-2 border-[var(--line-soft)]">
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

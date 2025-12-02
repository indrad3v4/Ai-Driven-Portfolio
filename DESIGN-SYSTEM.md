DESIGN SYSTEM — Sensual Anime Fusion (Dark Mode)
Visual language for indra-ai.dev Experience Engine
🎨 AESTHETIC PHILOSOPHY
Core Identity: Bold manga-inspired linework meets sophisticated jewel-tone gradients. Think Spider-Verse UI kinetics + Alita: Battle Angel holographic depth + Ghost in the Shell mature tech aesthetic.

Emotional Target: Powerful, sensual, immersive. Users should feel like they're inside an anime game world—not using a corporate tool.

Key Differentiators:

Jewel tones over neon — Amethyst/emerald/ruby vs. generic blue/green/red

Layered depth — Multiple shadow planes create anime-style depth

Sharp + soft contrast — Angular display fonts + rounded body text

Dark-first design — Light mode is optional, dark is the hero

1️⃣ COLOR SYSTEM
Dark Mode (Default)
css
/* === BACKGROUND LAYERS === */
:root[data-theme="dark"] {
  /* Void (Deepest Layer) */
  --bg-void: #0a0412;           /* Deep space purple-black, full-screen backgrounds */
  --bg-canvas: #12081d;         /* Primary canvas, main content area */
  --bg-surface: #1d0f2e;        /* Elevated surfaces (cards, panels) */
  --bg-overlay: #2a1640;        /* Modals, dropdowns, tooltips */
  
  /* === JEWEL TONE ACCENTS === */
  /* Amethyst (Primary) */
  --accent-amethyst-50: #f5e8ff;
  --accent-amethyst-100: #e9d0ff;
  --accent-amethyst-300: #c084fc;
  --accent-amethyst-500: #9d4edd;  /* PRIMARY — CTA buttons, focus states */
  --accent-amethyst-700: #7c3aed;
  --accent-amethyst-900: #5b21b6;
  
  /* Emerald (Success/Growth) */
  --accent-emerald-300: #6ee7b7;
  --accent-emerald-500: #10b981;   /* Success messages, growth indicators */
  --accent-emerald-700: #059669;
  
  /* Ruby (Error/Warning) */
  --accent-ruby-300: #fca5a5;
  --accent-ruby-500: #ef4444;      /* Errors, destructive actions */
  --accent-ruby-700: #dc2626;
  
  /* Sapphire (Info/Links) */
  --accent-sapphire-300: #93c5fd;
  --accent-sapphire-500: #3b82f6;  /* Info, hyperlinks */
  --accent-sapphire-700: #2563eb;
  
  /* Topaz (Highlight/Achievement) */
  --accent-topaz-300: #fcd34d;
  --accent-topaz-500: #f59e0b;     /* Highlights, achievements, tooltips */
  --accent-topaz-700: #d97706;
  
  /* === SKIN TONES (Warm, Soft) === */
  --skin-light: #fde4cf;           /* Light text on dark, headings */
  --skin-medium: #f4c7a1;          /* Hover states, emphasized text */
  --skin-shadow: #8b6f5a;          /* Muted text, disabled states */
  
  /* === LINEWORK (Manga-Inspired) === */
  --line-bold: #ffffff;            /* Sharp edges, primary borders */
  --line-soft: rgba(255, 255, 255, 0.2); /* Subtle dividers */
  --line-glow: rgba(157, 78, 221, 0.6);  /* Glowing accent borders */
  
  /* === TEXT HIERARCHY === */
  --text-primary: #fde4cf;         /* Main headings, body text */
  --text-secondary: #c4a88d;       /* Subheadings, labels */
  --text-muted: #8b7465;           /* Placeholders, hints, disabled */
  --text-inverse: #0a0412;         /* Text on colored backgrounds */
}
Light Mode (Optional Toggle)
css
:root[data-theme="light"] {
  /* Inverted hierarchy */
  --bg-void: #fef8f0;
  --bg-canvas: #fff5eb;
  --bg-surface: #ffe4d6;
  --bg-overlay: #ffd4c1;
  
  /* Darker jewel tones for contrast */
  --accent-amethyst-500: #7c3aed;
  --accent-emerald-500: #059669;
  --accent-ruby-500: #dc2626;
  --accent-sapphire-500: #2563eb;
  --accent-topaz-500: #d97706;
  
  /* Dark text on light */
  --text-primary: #2a1640;
  --text-secondary: #4a3257;
  --text-muted: #6b5270;
  --text-inverse: #fef8f0;
  
  /* Adjust linework for light mode */
  --line-bold: #2a1640;
  --line-soft: rgba(42, 22, 64, 0.2);
  --line-glow: rgba(124, 58, 237, 0.6);
}
Usage Rules
✅ ALWAYS use CSS variables — bg-[var(--bg-surface)] not bg-purple-900
✅ Dark mode is default — All designs assume data-theme="dark" on mount
✅ Transition smoothly — Theme toggle includes transition-colors duration-300
✅ Test both themes — Every component must be legible in dark AND light

2️⃣ TYPOGRAPHY SYSTEM
Font Stack
css
:root {
  /* Display (Sharp, Angular) */
  --font-display: 'Bebas Neue', 'Inter', sans-serif;
  
  /* Body (Soft, Rounded) */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Monospace (Code, Data) */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
}
How to load fonts:

tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
Type Scale
css
/* Mobile-first sizing (base 16px) */
--text-xs: 0.75rem;    /* 12px - timestamps, metadata */
--text-sm: 0.875rem;   /* 14px - body text, labels */
--text-base: 1rem;     /* 16px - standard paragraph */
--text-lg: 1.125rem;   /* 18px - emphasized text */
--text-xl: 1.5rem;     /* 24px - section headings */
--text-2xl: 2rem;      /* 32px - page headings */
--text-3xl: 3rem;      /* 48px - hero text */
--text-4xl: 4rem;      /* 64px - landing hero (desktop only) */

/* Responsive scaling */
@media (min-width: 768px) {
  --text-3xl: 4rem;    /* 64px on tablet+ */
  --text-4xl: 5rem;    /* 80px on desktop */
}
Weight Scale
css
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-black: 900;   /* Sparingly — impact moments only */
Line Heights
css
--leading-tight: 1.2;   /* Display fonts, headings */
--leading-normal: 1.5;  /* Body text */
--leading-relaxed: 1.75; /* Long-form content, articles */
Usage Patterns
Headings (Display Font):

tsx
<h1 className="
  font-[var(--font-display)] 
  text-[length:var(--text-4xl)] 
  font-[var(--weight-bold)] 
  leading-[var(--leading-tight)] 
  text-[var(--text-primary)]
">
  Landing Hero
</h1>
Body Text:

tsx
<p className="
  font-[var(--font-body)] 
  text-[length:var(--text-base)] 
  font-[var(--weight-normal)] 
  leading-[var(--leading-normal)] 
  text-[var(--text-secondary)]
">
  Standard paragraph text
</p>
Code/Data:

tsx
<code className="
  font-[var(--font-mono)] 
  text-[length:var(--text-sm)] 
  text-[var(--accent-sapphire-500)]
">
  const value = 42;
</code>
3️⃣ SPACING SYSTEM (8px Grid)
css
--space-1: 0.25rem;  /* 4px  - micro-adjustments */
--space-2: 0.5rem;   /* 8px  - tight padding */
--space-3: 0.75rem;  /* 12px - compact spacing */
--space-4: 1rem;     /* 16px - standard padding */
--space-5: 1.25rem;  /* 20px - comfortable padding */
--space-6: 1.5rem;   /* 24px - section spacing */
--space-8: 2rem;     /* 32px - large gaps */
--space-10: 2.5rem;  /* 40px - major sections */
--space-12: 3rem;    /* 48px - page sections */
--space-16: 4rem;    /* 64px - hero sections */
--space-20: 5rem;    /* 80px - massive gaps */
--space-24: 6rem;    /* 96px - landing sections */
Usage Guidelines:

Component padding: Use --space-4 (16px) or --space-6 (24px)

Section margins: Use --space-12 (48px) or --space-16 (64px)

Grid gaps: Use --space-4 (16px) or --space-6 (24px)

Micro-adjustments: Use --space-1 (4px) or --space-2 (8px)

4️⃣ BORDERS & SHADOWS (Manga-Inspired Depth)
Border Styles
css
/* Width + Style + Color combined */
--border-bold: 3px solid var(--line-bold);    /* Sharp edges, emphasis */
--border-soft: 1px solid var(--line-soft);    /* Subtle dividers */
--border-glow: 2px solid var(--line-glow);    /* Active/focus states */

/* Radius Scale */
--radius-none: 0;
--radius-sm: 4px;      /* Buttons, inputs */
--radius-md: 8px;      /* Cards, small panels */
--radius-lg: 16px;     /* Modals, major cards */
--radius-xl: 24px;     /* Hero sections */
--radius-full: 9999px; /* Pills, avatars */
Shadow System (Layered Depth)
css
/* Elevation layers (anime-style stacking) */
--shadow-sm: 0 2px 8px rgba(10, 4, 18, 0.3);          /* Subtle lift */
--shadow-md: 0 4px 16px rgba(10, 4, 18, 0.5);         /* Standard elevation */
--shadow-lg: 0 8px 32px rgba(10, 4, 18, 0.7);         /* Major elevation */
--shadow-xl: 0 16px 48px rgba(10, 4, 18, 0.8);        /* Modals, overlays */

/* Glowing accents (holographic feel) */
--shadow-glow-amethyst: 0 0 24px rgba(157, 78, 221, 0.6);
--shadow-glow-emerald: 0 0 24px rgba(16, 185, 129, 0.6);
--shadow-glow-ruby: 0 0 24px rgba(239, 68, 68, 0.6);

/* Inset shadows (depth inside elements) */
--shadow-inset: inset 0 2px 4px rgba(10, 4, 18, 0.4);
Layering Pattern:

css
/* Combine base shadow + glow for anime depth */
.card {
  box-shadow: 
    var(--shadow-md),
    var(--shadow-glow-amethyst);
}

/* Hover state adds more intensity */
.card:hover {
  box-shadow: 
    var(--shadow-lg),
    var(--shadow-glow-amethyst);
}
5️⃣ ANIMATION SYSTEM (Game-Feel Timing)
Easing Functions
css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);      /* Standard */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Playful overshoot */
--ease-snappy: cubic-bezier(0.34, 1.56, 0.64, 1);  /* Game-like snap */
Duration Scale
css
--duration-instant: 0ms;     /* No animation (accessibility) */
--duration-fast: 150ms;      /* Micro-interactions (button hover) */
--duration-normal: 300ms;    /* Standard transitions (modal open) */
--duration-slow: 500ms;      /* Page transitions */
--duration-xslow: 800ms;     /* Hero animations */
Common Animation Patterns
Button Press:

tsx
<button className="
  active:scale-95 
  transition-transform 
  duration-[var(--duration-fast)] 
  ease-[var(--ease-snappy)]
">
  Click Me
</button>
Card Hover:

tsx
<div className="
  hover:shadow-[var(--shadow-glow-amethyst)] 
  transition-shadow 
  duration-[var(--duration-normal)] 
  ease-[var(--ease-in-out)]
">
  Card Content
</div>
Page Transition:

tsx
// Framer Motion example
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ 
    duration: 0.5, 
    ease: [0.4, 0, 0.2, 1] // --ease-in-out
  }}
>
  Page Content
</motion.div>
Respect User Preferences:

css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
6️⃣ COMPONENT LIBRARY
Buttons
Primary (CTA):

tsx
<button className="
  px-6 py-3 
  bg-[var(--accent-amethyst-500)] 
  text-[var(--text-inverse)] 
  font-[var(--font-display)] 
  font-[var(--weight-bold)] 
  text-[length:var(--text-base)] 
  border-[var(--border-glow)] 
  rounded-[var(--radius-md)] 
  shadow-[var(--shadow-md)] 
  hover:bg-[var(--accent-amethyst-700)] 
  hover:shadow-[var(--shadow-glow-amethyst)] 
  active:scale-95 
  transition-all 
  duration-[var(--duration-fast)]
">
  Primary CTA
</button>
Secondary (Outline):

tsx
<button className="
  px-6 py-3 
  bg-transparent 
  text-[var(--accent-amethyst-500)] 
  font-[var(--font-body)] 
  font-[var(--weight-semibold)] 
  border-[var(--border-bold)] 
  border-[var(--accent-amethyst-500)] 
  rounded-[var(--radius-md)] 
  hover:bg-[var(--accent-amethyst-500)] 
  hover:text-[var(--text-inverse)] 
  transition-all 
  duration-[var(--duration-normal)]
">
  Secondary
</button>
Ghost (Minimal):

tsx
<button className="
  px-4 py-2 
  bg-transparent 
  text-[var(--text-secondary)] 
  hover:text-[var(--text-primary)] 
  hover:bg-[var(--bg-surface)] 
  rounded-[var(--radius-sm)] 
  transition-all 
  duration-[var(--duration-fast)]
">
  Ghost
</button>
Input Fields
Text Input:

tsx
<input 
  type="text"
  placeholder="Enter text..."
  className="
    w-full 
    px-4 py-3 
    bg-[var(--bg-surface)] 
    text-[var(--text-primary)] 
    placeholder:text-[var(--text-muted)] 
    border-[var(--border-soft)] 
    rounded-[var(--radius-sm)] 
    focus:border-[var(--border-glow)] 
    focus:outline-none 
    focus:shadow-[var(--shadow-glow-amethyst)] 
    transition-all 
    duration-[var(--duration-fast)]
  "
/>
Textarea:

tsx
<textarea 
  rows={4}
  placeholder="Enter description..."
  className="
    w-full 
    px-4 py-3 
    bg-[var(--bg-surface)] 
    text-[var(--text-primary)] 
    border-[var(--border-soft)] 
    rounded-[var(--radius-md)] 
    focus:border-[var(--border-glow)] 
    focus:outline-none 
    resize-none
  "
/>
Cards
Standard Card:

tsx
<div className="
  p-6 
  bg-[var(--bg-surface)] 
  border-[var(--border-soft)] 
  rounded-[var(--radius-lg)] 
  shadow-[var(--shadow-md)] 
  hover:shadow-[var(--shadow-lg)] 
  hover:border-[var(--border-glow)] 
  transition-all 
  duration-[var(--duration-normal)]
">
  <h3 className="text-[length:var(--text-xl)] font-[var(--weight-bold)] text-[var(--text-primary)]">
    Card Title
  </h3>
  <p className="mt-2 text-[var(--text-secondary)]">
    Card description text goes here.
  </p>
</div>
Glowing Card (Active State):

tsx
<div className="
  p-6 
  bg-[var(--bg-surface)] 
  border-[var(--border-glow)] 
  rounded-[var(--radius-lg)] 
  shadow-[var(--shadow-lg)] 
  shadow-[var(--shadow-glow-amethyst)]
">
  Active Card Content
</div>
Badges
Status Badges:

tsx
{/* Success */}
<span className="
  px-3 py-1 
  bg-[var(--accent-emerald-500)] 
  text-[var(--text-inverse)] 
  text-[length:var(--text-xs)] 
  font-[var(--weight-semibold)] 
  rounded-[var(--radius-full)] 
  uppercase 
  tracking-wide
">
  Active
</span>

{/* Error */}
<span className="
  px-3 py-1 
  bg-[var(--accent-ruby-500)] 
  text-[var(--text-inverse)] 
  text-[length:var(--text-xs)] 
  rounded-[var(--radius-full)]
">
  Error
</span>
7️⃣ LAYOUT PATTERNS
Container Widths
css
--container-sm: 640px;   /* Mobile landscape, forms */
--container-md: 768px;   /* Tablet portrait */
--container-lg: 1024px;  /* Tablet landscape, main content */
--container-xl: 1280px;  /* Desktop */
--container-2xl: 1536px; /* Large desktop, landing pages */
Usage:

tsx
<div className="
  max-w-[var(--container-lg)] 
  mx-auto 
  px-[var(--space-4)] 
  md:px-[var(--space-6)]
">
  Centered content
</div>
Grid Systems
Responsive Grid:

tsx
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4 
  gap-[var(--space-6)]
">
  {items.map(item => (
    <div key={item.id} className="...">
      {item.content}
    </div>
  ))}
</div>
Bento Grid (Asymmetric):

tsx
<div className="
  grid 
  grid-cols-6 
  grid-rows-4 
  gap-[var(--space-4)] 
  h-screen
">
  <div className="col-span-4 row-span-2 ...">Large Feature</div>
  <div className="col-span-2 row-span-2 ...">Sidebar</div>
  <div className="col-span-2 row-span-2 ...">Secondary</div>
  <div className="col-span-4 row-span-2 ...">Tertiary</div>
</div>
8️⃣ THEME TOGGLE IMPLEMENTATION
localStorage Key: theme-preference
Default Value: dark
Attribute: data-theme on <html> element

React Hook
tsx
// hooks/useTheme.ts
'use client';
import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme-preference') as Theme | null;
    const initial = stored || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);
  
  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme-preference', next);
    document.documentElement.setAttribute('data-theme', next);
  };
  
  // Prevent flash of unstyled content
  if (!mounted) return { theme: 'dark', toggleTheme: () => {} };
  
  return { theme, toggleTheme };
}
Theme Toggle Component
tsx
// components/atoms/ThemeToggle.tsx
'use client';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="
        px-4 py-2 
        rounded-[var(--radius-full)] 
        bg-[var(--bg-overlay)] 
        text-[var(--text-primary)] 
        border-[var(--border-soft)] 
        hover:border-[var(--border-glow)] 
        transition-all 
        duration-[var(--duration-fast)]
        flex items-center gap-2
      "
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <>
          <span className="text-lg">☀️</span>
          <span className="text-[length:var(--text-sm)]">Light</span>
        </>
      ) : (
        <>
          <span className="text-lg">🌙</span>
          <span className="text-[length:var(--text-sm)]">Dark</span>
        </>
      )}
    </button>
  );
}
Prevent Flash on Load
tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme-preference') || 'dark';
              document.documentElement.setAttribute('data-theme', theme);
            })();
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
9️⃣ ACCESSIBILITY CHECKLIST
✅ Color Contrast: WCAG AA compliant (4.5:1 for normal text, 3:1 for large)
✅ Focus Indicators: All interactive elements have visible focus states
✅ Keyboard Navigation: Tab order is logical, Escape closes modals
✅ Screen Readers: Semantic HTML + ARIA labels where needed
✅ Motion Preferences: Respect prefers-reduced-motion
✅ Font Scaling: Support browser font size adjustments
✅ Touch Targets: Minimum 44x44px for mobile

Example Focus State:

tsx
<button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-[var(--accent-amethyst-500)] 
  focus:ring-offset-2 
  focus:ring-offset-[var(--bg-canvas)]
">
  Accessible Button
</button>
🔟 CRITICAL RULES (NEVER VIOLATE)
✅ DO:
Use CSS variables exclusively — bg-[var(--bg-surface)] not bg-purple-900

Default to dark mode — All new components assume data-theme="dark"

Make interactions rewarding — Buttons scale (active:scale-95), cards lift, progress animates

Layer shadows for depth — Combine base shadow + glow for anime-style elevation

Test both themes — Every component must be legible in dark AND light

Use jewel tones for accents — Amethyst (primary), emerald (success), ruby (error)

❌ DON'T:
Hardcode colors — If you write text-purple-600 or #9d4edd, STOP

Break theme persistence — Theme must survive page refresh via localStorage

Use generic designs — If it looks like Bootstrap, it's wrong

Ignore accessibility — Every component needs focus states, ARIA labels

Skip animation — Static UIs feel dead; add subtle transitions everywhere

Mix inline styles — Only use Tailwind classes with CSS variables

📚 USAGE WORKFLOW
Initialize AI Studio session with AI-STUDIO-INTRO-PROMPT.md

Reference this DESIGN_SYSTEM.md for visual language rules

Request specific component (e.g., "Generate Landing Hero")

Code Agent will:

Use ONLY CSS variables from this system

Implement dark mode by default

Follow component patterns defined above

Include theme toggle if it's a new page

Ensure animations feel game-like

🎯 NEXT STEPS
After confirming this design system:

Generate styles/globals.css with all variables defined

Create components/atoms/ThemeToggle.tsx

Update app/layout.tsx with theme initialization

Build component library (Button, Input, Card, Badge)

Implement page-specific designs (Landing, Game, Cabinet)

END OF DESIGN_SYSTEM.MD

Last Updated: December 1, 2025, 10:15 PM CET
Status: Ready for implementation
Theme: Dark-first Sensual Anime Fusion
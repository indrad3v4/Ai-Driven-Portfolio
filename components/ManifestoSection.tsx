
/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Manifesto Section: Madhukaramayī (Honey Clarity) + SEO Schema
 * Replaces vague footer tagline with value-driven manifesto.
 * Injects real-time Google Trends data using Gemini 2.5 Flash.
 */

import React, { useEffect, useState } from 'react';
import { generateOrganizationSchema, generateServiceSchema, injectJsonLd } from '../lib/seo';
import { getTrendingAIKeywords } from '../services/gemini';

interface ManifestoSectionProps {
  showFullManifesto?: boolean; // true = hero section, false = footer
  onAction?: () => void; // Callback for the main CTA button
}

/**
 * Honey Statement: The core value manifesto
 */
const HONEY_STATEMENT = {
  headline: 'INDRADEVA MANIFESTO',
  subHeadline: 'We ship working AI in 2 weeks, not 6 months of vaporware.',
  body: `Built for early-stage product teams, internal tools, and builders who need proof before pivot. You don't need an AI lab — you need a neural link to clarity. That's Indra.`,

  // Evergreen keywords for static SEO (Crawlers see this)
  staticKeywords: [
    'AI Systems',
    'Product Teams',
    'Neural Link',
    'Clarity',
    'Rapid Deployment',
    'Builders',
    'Internal Tools',
  ],

  longForm: `Our AI solves the $2B problem: teams build vaporware while competitors ship. We architect AI systems that work *now*—not in 6 months behind a "coming soon" button. 

Our approach: 2-week delivery cycles, provable outcomes, built for Ambika (the warrior architect in you). We connect insight (strategy) to creation (output) through a neural interface you control.

Clients: early-stage products, internal team augmentation, builders who value execution over theory.

Why now: AI moves fast. Your team deserves a partner who ships as fast as your ambition.`,

  vedic: {
    concept: 'मधुकरमयी (Madhukaramayī)',
    meaning: 'Honey-laden clarity that draws seekers like bees',
    principle: 'One manifesto. One target. One golden why.',
  },
};

export const ManifestoSection: React.FC<ManifestoSectionProps> = ({
  showFullManifesto = false,
  onAction
}) => {
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>(HONEY_STATEMENT.staticKeywords);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);

  // 1. SEO Injection (Static Schema)
  useEffect(() => {
    const orgSchema = generateOrganizationSchema({
        name: 'Indra-AI',
        description: HONEY_STATEMENT.body,
        url: window.location.origin,
        foundingDate: '2024',
        email: 'contact@indra-ai.dev'
    });
    
    const serviceSchema = generateServiceSchema({
        name: 'AI System Architecture',
        description: HONEY_STATEMENT.longForm,
        provider: 'Indra-AI',
        deliveryTime: 14
    });

    injectJsonLd([orgSchema, serviceSchema], 'manifesto-schema');
  }, []);

  // 2. Dynamic Trend Injection (Live Data from Gemini + Google Search)
  useEffect(() => {
    let isMounted = true;
    
    const fetchLiveTrends = async () => {
      try {
        // Ask Gemini 2.5 Flash to browse the web for today's top AI dev trends
        const liveTrends = await getTrendingAIKeywords();
        
        if (isMounted && liveTrends && liveTrends.length > 0) {
          // Merge with static keywords, but prioritize new ones
          // Take top 5 live trends + top 3 static keywords
          const combined = [
            ...liveTrends.slice(0, 5),
            ...HONEY_STATEMENT.staticKeywords.slice(0, 3)
          ];
          setTrendingKeywords(combined);
        }
      } catch (e) {
        console.warn("Trend fetch failed, using static keywords", e);
      } finally {
        if (isMounted) setIsLoadingTrends(false);
      }
    };

    fetchLiveTrends();

    return () => { isMounted = false; };
  }, []);

  return (
    <section className="manifesto-section mt-4 mb-4 h-full flex flex-col">
        <div className="manifesto-container flex-1 flex flex-col justify-between">
          
          {/* --- HEADER --- */}
          <div className="text-center mb-8">
             <h2 className="manifesto-headline text-[var(--accent-topaz-500)] animate-pulse">
                {HONEY_STATEMENT.headline}
            </h2>
            <div className="h-[1px] w-24 bg-[var(--line-soft)] mx-auto mt-4"></div>
          </div>

          {/* --- BODY (THE HONEY) --- */}
          <div className="text-left space-y-6">
            <h3 className="font-display text-2xl md:text-3xl text-white leading-tight">
              {HONEY_STATEMENT.subHeadline}
            </h3>
            
            <p className="manifesto-body text-lg">
              {HONEY_STATEMENT.body}
            </p>

            {showFullManifesto && (
                <div className="manifesto-extended">
                <p className="whitespace-pre-wrap font-mono text-sm text-[var(--text-secondary)]">
                    {HONEY_STATEMENT.longForm}
                </p>
                </div>
            )}
          </div>

          {/* --- LIVE INTELLIGENCE CLOUD --- */}
          <div className="my-8">
             <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${isLoadingTrends ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`}></span>
                <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest uppercase">
                    {isLoadingTrends ? 'SCANNING LIVE TRENDS...' : 'LIVE INTELLIGENCE STREAM'}
                </span>
             </div>
             
             <div className="keyword-cloud">
                {trendingKeywords.map((keyword, idx) => (
                <span key={idx} className="keyword-badge animate-in fade-in slide-in-from-bottom-2 duration-500" style={{animationDelay: `${idx * 100}ms`}}>
                    {keyword}
                </span>
                ))}
            </div>
          </div>

          {/* --- CTA (ACTIONABLE) --- */}
          <div className="mt-auto mb-8">
             <button 
                onClick={onAction}
                className="w-full py-4 bg-[var(--accent-amethyst-500)]/10 border border-[var(--accent-amethyst-500)] hover:bg-[var(--accent-amethyst-500)] hover:text-white text-[var(--accent-amethyst-500)] font-display text-xl tracking-widest rounded transition-all group"
             >
                <span className="group-hover:hidden">READY TO SHIP?</span>
                <span className="hidden group-hover:inline">ARCHITECT YOUR CLARITY {'>'}</span>
             </button>
          </div>

          {/* --- VEDIC FOOTER (SIGNATURE) --- */}
          <div className="text-center border-t border-[var(--line-soft)] pt-6 mt-4 opacity-60 hover:opacity-100 transition-opacity">
            <div className="vedic-badge inline-flex items-center gap-2 mb-2">
                <span className="vedic-symbol text-2xl filter drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">🍯</span>
            </div>
            <div className="font-mono text-[10px] text-[#ffd700] tracking-[0.2em] uppercase">
                 {HONEY_STATEMENT.vedic.concept}
            </div>
            <div className="font-mono text-[8px] text-[var(--text-muted)] mt-1">
                {HONEY_STATEMENT.vedic.meaning}
            </div>
          </div>

        </div>

        <style>{`
          .manifesto-section {
            /* Reset standard section padding to fit modal */
            padding: 1rem 0;
          }

          .manifesto-container {
            max-width: 600px;
            margin: 0 auto;
            width: 100%;
          }

          .manifesto-headline {
            font-family: var(--font-display);
            font-size: 3rem;
            font-weight: 900;
            letter-spacing: 0.1em;
            line-height: 1;
          }

          .manifesto-body {
            font-family: var(--font-body);
            font-weight: 300;
            color: var(--text-primary);
            opacity: 0.9;
            border-left: 2px solid var(--accent-emerald-500);
            padding-left: 1rem;
          }

          .manifesto-extended {
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.25rem;
            border: 1px solid var(--line-soft);
          }

          .keyword-cloud {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .keyword-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: rgba(0, 255, 150, 0.05);
            border: 1px solid rgba(0, 255, 150, 0.2);
            border-radius: 2px;
            font-size: 0.7rem;
            color: var(--accent-emerald-500);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-family: var(--font-mono);
          }
          
          /* Mobile adjustments */
          @media (max-width: 768px) {
             .manifesto-headline { font-size: 2rem; }
             .manifesto-body { font-size: 1rem; }
          }
        `}</style>
    </section>
  );
};

export default ManifestoSection;

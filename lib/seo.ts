/**
 * @license SPDX-License-Identifier: Apache-2.0
 * SEO Utilities: Meta tags + JSON-LD schema generation
 * Auto-injects SEO metadata optimized for AI search engines
 */

export interface SEOMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string[];
  author?: string;
}

/**
 * Generate standard meta tags for HTML head
 */
export const generateMetaTags = (meta: SEOMeta) => {
  const tags: { name?: string; property?: string; content: string }[] = [
    {
      name: 'description',
      content: meta.description,
    },
    {
      name: 'keywords',
      content: meta.keywords?.join(', ') || '',
    },
    {
      property: 'og:title',
      content: meta.title,
    },
    {
      property: 'og:description',
      content: meta.description,
    },
    {
      property: 'og:type',
      content: meta.ogType || 'website',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: meta.title,
    },
    {
      name: 'twitter:description',
      content: meta.description,
    },
  ];

  if (meta.ogImage) {
    tags.push(
      {
        property: 'og:image',
        content: meta.ogImage,
      },
      {
        name: 'twitter:image',
        content: meta.ogImage,
      }
    );
  }

  if (meta.author) {
    tags.push({
      name: 'author',
      content: meta.author,
    });
  }

  return tags;
};

/**
 * Update DOM meta tags dynamically (Client-side SEO)
 */
export const applyDOMMetaTags = (tags: { name?: string; property?: string; content: string }[]) => {
  if (typeof document === 'undefined') return;

  tags.forEach(tag => {
    let element: HTMLMetaElement | null = null;
    if (tag.name) {
      element = document.querySelector(`meta[name="${tag.name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', tag.name);
        document.head.appendChild(element);
      }
    } else if (tag.property) {
      element = document.querySelector(`meta[property="${tag.property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      }
    }
    
    if (element) {
      element.setAttribute('content', tag.content);
    }
  });
};

/**
 * Generate Organization JSON-LD schema
 * Tells AI search engines who you are
 */
export const generateOrganizationSchema = (data: {
  name: string;
  description: string;
  url: string;
  logo?: string;
  email?: string;
  phone?: string;
  foundingDate?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: data.name,
  url: data.url,
  description: data.description,
  logo: data.logo || `${data.url}/logo.png`,
  email: data.email,
  phone: data.phone,
  foundingDate: data.foundingDate,
  sameAs: [
    'https://github.com/indrad3v4',
    'https://twitter.com/indra_ai',
  ],
});

/**
 * Generate Service JSON-LD schema
 * Tells AI search engines what you offer
 */
export const generateServiceSchema = (data: {
  name: string;
  description: string;
  provider: string;
  areaServed?: string[];
  deliveryTime?: number;
  priceRange?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: data.name,
  description: data.description,
  provider: {
    '@type': 'Organization',
    name: data.provider,
  },
  areaServed: data.areaServed || ['US', 'EU', 'APAC'],
  deliveryLeadTime:
    data.deliveryTime !== undefined
      ? {
          '@type': 'QuantitativeValue',
          value: data.deliveryTime,
          unitCode: 'DAY',
        }
      : undefined,
  priceRange: data.priceRange,
});

/**
 * Generate BreadcrumbList schema for navigation SEO
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/**
 * Inject JSON-LD script tag into document
 */
export const injectJsonLd = (schema: object, scriptId: string = 'json-ld') => {
  if (typeof document === 'undefined') return; // SSR guard

  const existingScript = document.getElementById(scriptId);
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);

  console.log(`[SEO] JSON-LD schema injected (${scriptId})`);
};

const DEFAULT_IMAGE = 'https://indra-ai.dev/og-image.png';

/**
 * Page-specific SEO config
 */
export const PAGE_SEO_CONFIG = {
  landing: {
    title: 'Indra-AI: Ship AI Systems in 2 Weeks',
    description:
      'We ship working AI systems in 2 weeks, not 6 months. Built for early-stage products, internal tools, and builders who need clarity.',
    ogImage: DEFAULT_IMAGE,
    keywords: [
      'AI systems',
      'product development',
      'neural link',
      'rapid deployment',
      'builders',
      'clarity',
    ],
  },

  game: {
    title: 'INSERT MIND: The AI System Builder Game',
    description:
      'Join Ambika in an interactive journey to architect your AI system. Learn game design + strategic thinking through narrative gameplay.',
    ogImage: DEFAULT_IMAGE,
    keywords: [
      'game design',
      'AI architecture',
      'system thinking',
      'interactive learning',
      'Ambika',
    ],
  },

  portfolio: {
    title: 'Raid Victories: Indra-AI Projects',
    description:
      'See the systems we shipped. Real products, real impact, real speed. Your next success story starts here.',
    ogImage: DEFAULT_IMAGE,
    keywords: [
      'portfolio',
      'case studies',
      'AI projects',
      'success stories',
      'shipped products',
    ],
  },
};

/**
 * Helper: Get SEO config by page
 */
export const getSEOConfig = (page: keyof typeof PAGE_SEO_CONFIG) => {
  return PAGE_SEO_CONFIG[page] || PAGE_SEO_CONFIG.landing;
};
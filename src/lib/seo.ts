// SEO helpers — JSON-LD schema generators and meta builders
const SITE_URL = 'https://giangnguyengroup.lovable.app';
const ORG_NAME = 'Giang Nguyên Group';
const ORG_PHONE = '+84933562286';
const ORG_LOGO = `${SITE_URL}/images/logo-giang-nguyen-group.jpg`;

export interface ProductLD {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  slug: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  brand?: string;
  category?: string;
}

export interface ArticleLD {
  title: string;
  description: string;
  image: string;
  slug: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function organizationLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: SITE_URL,
    logo: ORG_LOGO,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: ORG_PHONE,
      contactType: 'customer service',
      areaServed: 'VN',
      availableLanguage: ['Vietnamese'],
    },
    sameAs: [
      'https://www.facebook.com/giangnguyengroup',
      'https://zalo.me/0933562286',
    ],
  };
}

export function localBusinessLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: ORG_NAME,
    image: ORG_LOGO,
    telephone: ORG_PHONE,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sầm Sơn',
      addressRegion: 'Thanh Hóa',
      addressCountry: 'VN',
    },
  };
}

export function productLD(p: ProductLD) {
  const images = Array.isArray(p.image) ? p.image : [p.image];
  const ld: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: images,
    sku: p.slug,
    brand: { '@type': 'Brand', name: p.brand || ORG_NAME },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${p.slug}`,
      priceCurrency: 'VND',
      price: p.price,
      availability: p.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: ORG_NAME },
    },
  };
  if (p.category) ld.category = p.category;
  if (p.rating && p.reviewCount) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.rating.toFixed(1),
      reviewCount: p.reviewCount,
    };
  }
  return ld;
}

export function articleLD(a: ArticleLD) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    image: a.image,
    datePublished: a.datePublished || new Date().toISOString(),
    dateModified: a.dateModified || a.datePublished || new Date().toISOString(),
    author: { '@type': 'Organization', name: a.author || ORG_NAME },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      logo: { '@type': 'ImageObject', url: ORG_LOGO },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/${a.slug}` },
  };
}

export function recipeLD(r: {
  name: string; description: string; image: string;
  prepTime?: string; servings?: string; ingredients: string[]; steps: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: r.name,
    description: r.description,
    image: r.image,
    author: { '@type': 'Organization', name: ORG_NAME },
    totalTime: r.prepTime,
    recipeYield: r.servings,
    recipeIngredient: r.ingredients,
    recipeInstructions: r.steps.map((s, i) => ({
      '@type': 'HowToStep', position: i + 1, text: s,
    })),
  };
}

export function breadcrumbLD(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
    })),
  };
}

export { SITE_URL };

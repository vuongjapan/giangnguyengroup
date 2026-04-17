import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
}

const SITE_URL = 'https://giangnguyengroup.lovable.app';
const DEFAULT_IMAGE = `${SITE_URL}/images/logo-giang-nguyen-group.jpg`;

export default function SEO({
  title = 'Giang Nguyên Group – Hải Sản Khô Đặc Sản Sầm Sơn',
  description = 'Hải sản khô Sầm Sơn cao cấp: mực khô, cá thu một nắng, nem chua Thanh Hóa. Ship toàn quốc.',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  jsonLd,
  noindex = false,
}: SEOProps) {
  const fullTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
  const fullDesc = description.length > 160 ? description.slice(0, 157) + '...' : description;
  const canonical = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      <meta name="twitter:image" content={image} />

      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(data)}</script>
      ))}
    </Helmet>
  );
}

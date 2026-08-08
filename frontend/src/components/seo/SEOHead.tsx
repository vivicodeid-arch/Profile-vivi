import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  schema?: object;
}

const BASE_URL = 'https://vividev.id';
const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

export const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noIndex = false,
  schema,
}: SEOHeadProps) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'id';
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  // Hreflang: Google recommends separate URLs per language. Since this is a
  // single-domain SPA that uses localStorage for language preference, we point
  // both hreflang tags to the same canonical URL. This is valid per Google's
  // spec — do NOT use ?lang= query params because Google treats them as
  // duplicate pages and may canonicalize to the wrong variant.
  const idUrl = canonicalUrl;
  const enUrl = canonicalUrl;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow" />
      }
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang */}
      <link rel="alternate" hrefLang="id" href={idUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="ViviDev.id" />
      <meta property="og:locale" content={lang === 'id' ? 'id_ID' : 'en_US'} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vividevid" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

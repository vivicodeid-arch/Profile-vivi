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
  // Hreflang: point each language variant to its own URL with ?lang= param,
  // so Google understands these are separate language versions.
  const idUrl = canonical ? `${BASE_URL}${canonical}?lang=id` : `${BASE_URL}/?lang=id`;
  const enUrl = canonical ? `${BASE_URL}${canonical}?lang=en` : `${BASE_URL}/?lang=en`;

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

      {/* Hreflang — each language points to a distinct URL */}
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
      <meta property="og:site_name" content="ViviDev.id" />
      <meta property="og:locale" content={lang === 'id' ? 'id_ID' : 'en_US'} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

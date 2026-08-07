import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import ErrorAlert from '../components/ui/ErrorAlert';
import { useApi } from '../hooks/useApi';
import type { Portfolio as PortfolioType } from '../types';
import { SITE_NAME } from '../lib/constants';

const CATEGORIES = ['all', 'company', 'ecommerce', 'webapp', 'landing'] as const;
type Category = typeof CATEGORIES[number];

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `Portfolio — ${SITE_NAME}`,
  description: 'Kumpulan proyek website yang telah kami kerjakan.',
};

export default function Portfolio() {
  const { t, i18n } = useTranslation(['pages']);
  const lang = i18n.language as 'id' | 'en';
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const { data: items, isLoading, error } = useApi<PortfolioType[]>('/portfolio');

  const filtered = items
    ? activeCategory === 'all'
      ? items
      : items.filter(item => item.category === activeCategory)
    : [];

  return (
    <>
      <SEOHead
        title={t('portfolio.meta.title')}
        description={t('portfolio.meta.description')}
        canonical="/portfolio"
        schema={schema}
      />

      <PageHero
        page="portfolio"
        titleKey="portfolio.hero.title"
        subtitleKey="portfolio.hero.subtitle"
      />

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat === 'all' ? t('portfolio.filter.all') : cat}
              </button>
            ))}
          </div>

          {isLoading && <Spinner />}
          {error && <ErrorAlert message={error} />}

          {!isLoading && !error && filtered.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-16">
              {t('portfolio.empty')}
            </p>
          )}

          {filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(item => (
                <article
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title[lang]}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        {item.title[lang]}
                      </h2>
                      {item.projectUrl && (
                        <a
                          href={item.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Buka ${item.title[lang]}`}
                          className="shrink-0 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" aria-hidden="true" />
                        </a>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description[lang]}
                    </p>

                    {item.techStack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {item.techStack.map(tech => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-full font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

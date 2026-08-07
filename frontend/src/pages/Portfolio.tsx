import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { useSettingsStore } from '../store/settingsStore';
import api from '../services/api';
import type { Portfolio as PortfolioType } from '../types';

const CATEGORIES = ['all', 'company', 'ecommerce', 'webapp', 'landing'];



const POSITION_CSS: Record<string, string> = {
  "top-left":     "top left",
  "top":          "top center",
  "top-right":    "top right",
  "left":         "center left",
  "center":       "center center",
  "right":        "center right",
  "bottom-left":  "bottom left",
  "bottom":       "bottom center",
  "bottom-right": "bottom right",
};

function PortfolioHero() {
  const { settings } = useSettingsStore();
  const { t } = useTranslation(["pages"]);
  const heroType = settings.portfolioHeroType || "gradient";
  const heroUrl  = settings.portfolioHeroUrl  || "";
  const title    = settings.portfolioHeroTitle    || t("portfolio.hero.title");
  const subtitle = settings.portfolioHeroSubtitle || t("portfolio.hero.subtitle");
  const position = POSITION_CSS[settings.portfolioHeroPosition || "center"] || "center center";

  if (heroType === "image" && heroUrl) {
    return (
      <section className="relative pt-32 pb-16 text-white overflow-hidden min-h-[220px]">
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${heroUrl})`, backgroundPosition: position }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="container-custom relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-white/80 max-w-2xl">{subtitle}</p>
        </div>
      </section>
    );
  }

  if (heroType === "video" && heroUrl) {
    return (
      <section className="relative pt-32 pb-16 text-white overflow-hidden min-h-[220px]">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: position }}
          src={heroUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="container-custom relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-white/80 max-w-2xl">{subtitle}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-16 bg-gradient-to-br from-gray-900 to-primary-900 text-white">
      <div className="container-custom">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-gray-300 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}
export default function Portfolio() {
  const { t, i18n } = useTranslation(['common', 'pages']);
  const lang = i18n.language as 'id' | 'en';
  const [portfolios, setPortfolios] = useState<PortfolioType[]>([]);
  const [active, setActive] = useState('all');

  useEffect(() => {
    api.get('/portfolio').then(r => setPortfolios(r.data.data || [])).catch(() => {});
  }, []);

  const filtered = active === 'all' ? portfolios : portfolios.filter(p => p.category === active);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Portfolio ViviDev.id',
    itemListElement: filtered.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: (p.title as Record<string, string>)[lang],
      url: p.projectUrl || 'https://vividev.id/portfolio',
    })),
  };

  return (
    <>
      <SEOHead
        title="Portfolio Proyek — ViviDev.id"
        description="Lihat koleksi proyek website profesional yang telah kami kerjakan untuk berbagai klien bisnis."
        canonical="/portfolio"
        schema={schema}
      />

      {/* Hero */}
      <PortfolioHero />

      {/* Filter */}
      <section className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-16 z-30">
        <div className="container-custom py-4 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                active === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {t(`portfolio.filter.${cat}`, { ns: 'pages' })}
            </button>
          ))}
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="section-padding bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              <p>Belum ada proyek di kategori ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(item => (
                <article key={item.id} className="card group overflow-hidden">
                  <div className="relative overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
                    <img
                      src={item.imageUrl}
                      alt={(item.title as Record<string, string>)[lang]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {item.featured && (
                      <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">Featured</span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {(item.title as Record<string, string>)[lang]}
                      </h2>
                      {item.projectUrl && (
                        <a href={item.projectUrl} target="_blank" rel="noopener noreferrer"
                          aria-label="View project" className="text-primary-600 hover:text-primary-700 shrink-0">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {(item.description as Record<string, string>)[lang]}
                    </p>
                    {item.techStack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {item.techStack.map(tech => (
                          <span key={tech} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-full font-medium">
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

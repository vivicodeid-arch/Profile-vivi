import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Code2, Globe, Palette, Search, Wrench, Smartphone, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { useSettingsStore } from '../store/settingsStore';
import api from '../services/api';
import type { Service } from '../types';

const iconMap: Record<string, React.ElementType> = {
  globe: Globe, code: Code2, palette: Palette,
  search: Search, wrench: Wrench, smartphone: Smartphone,
};

const POSITION_CSS: Record<string, string> = {
  'top-left': 'top left', 'top': 'top center', 'top-right': 'top right',
  'left': 'center left', 'center': 'center center', 'right': 'center right',
  'bottom-left': 'bottom left', 'bottom': 'bottom center', 'bottom-right': 'bottom right',
};

function ServicesHero() {
  const { settings } = useSettingsStore();
  const { t } = useTranslation(['pages']);
  const heroType = settings.servicesHeroType || 'gradient';
  const heroUrl  = settings.servicesHeroUrl  || '';
  const title    = settings.servicesHeroTitle    || t('services.hero.title');
  const subtitle = settings.servicesHeroSubtitle || t('services.hero.subtitle');
  const position = POSITION_CSS[settings.servicesHeroPosition || 'center'] || 'center center';

  if (heroType === 'image' && heroUrl) {
    return (
      <section className="relative pt-32 pb-16 text-white overflow-hidden min-h-[220px]">
        <div className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${heroUrl})`, backgroundPosition: position }} aria-hidden="true" />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="container-custom relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-white/80 max-w-2xl">{subtitle}</p>
        </div>
      </section>
    );
  }

  if (heroType === 'video' && heroUrl) {
    return (
      <section className="relative pt-32 pb-16 text-white overflow-hidden min-h-[220px]">
        <video className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: position }}
          src={heroUrl} autoPlay muted loop playsInline aria-hidden="true" />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="container-custom relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-white/80 max-w-2xl">{subtitle}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-16 bg-gradient-to-br from-primary-900 to-primary-700 text-white">
      <div className="container-custom">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-primary-200 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}

function ServiceCard({ service, lang, index }: { service: Service; lang: string; index: number }) {
  const Icon = iconMap[service.icon] || Code2;
  const hasImage = !!service.imageUrl;
  const isEven = index % 2 === 0;

  if (hasImage) {
    return (
      <div className="card overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
        <div className={"flex flex-col md:flex-row" + (isEven ? '' : ' md:flex-row-reverse')}>
          {/* Content */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 group-hover:bg-primary-600 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-200">
              <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors duration-200" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {(service.title as Record<string, string>)[lang]}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
              {(service.description as Record<string, string>)[lang]}
            </p>
          </div>
          {/* Image */}
          <div className="md:w-2/5 h-52 md:h-auto overflow-hidden">
            <img
              src={service.imageUrl!}
              alt={(service.title as Record<string, string>)[lang]}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    );
  }

  // Default card (no image)
  return (
    <div className="card p-8 group hover:-translate-y-1 transition-transform duration-200">
      <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 group-hover:bg-primary-600 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-200">
        <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors duration-200" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {(service.title as Record<string, string>)[lang]}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
        {(service.description as Record<string, string>)[lang]}
      </p>
    </div>
  );
}

export default function Services() {
  const { t, i18n } = useTranslation(['common', 'pages']);
  const lang = i18n.language as 'id' | 'en';
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data.data || [])).catch(() => {});
  }, []);

  const hasAnyImage = services.some(s => !!s.imageUrl);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Layanan ViviDev.id',
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: (s.title as Record<string, string>)[lang],
    })),
  };

  return (
    <>
      <SEOHead
        title="Layanan Web Development — ViviDev.id"
        description="ViviDev.id menyediakan layanan pembuatan website, aplikasi web, UI/UX design, SEO, dan maintenance untuk bisnis Anda."
        canonical="/services"
        schema={schema}
      />

      <ServicesHero />

      {/* Services */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          {hasAnyImage ? (
            /* Layout list (full-width cards) ketika ada image */
            <div className="flex flex-col gap-8">
              {services.map((service, index) => (
                <ServiceCard key={service.id} service={service} lang={lang} index={index} />
              ))}
            </div>
          ) : (
            /* Layout grid 3 kolom ketika tidak ada image */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ServiceCard key={service.id} service={service} lang={lang} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gray-50 dark:bg-gray-950">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tertarik dengan layanan kami?</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">Konsultasikan kebutuhan website Anda dengan tim ViviDev.id sekarang, gratis!</p>
          <Link to="/contact" className="mt-8 inline-flex btn-primary text-base px-8 py-4">
            {t('cta.contactUs')} <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

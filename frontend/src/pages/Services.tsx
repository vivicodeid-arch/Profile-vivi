import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import ErrorAlert from '../components/ui/ErrorAlert';
import { useApi } from '../hooks/useApi';
import { SERVICE_ICON_MAP, SITE_NAME } from '../lib/constants';
import type { Service } from '../types';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `Layanan — ${SITE_NAME}`,
  description: 'Layanan web development profesional dari ViviDev.id',
};

interface ServiceCardProps {
  service: Service;
  lang: 'id' | 'en';
  index: number;
}

function ServiceCard({ service, lang, index }: ServiceCardProps) {
  const Icon = SERVICE_ICON_MAP[service.icon] ?? SERVICE_ICON_MAP.code;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {service.imageUrl ? (
        <img
          src={service.imageUrl}
          alt={service.title[lang]}
          className="w-12 h-12 object-contain mb-4"
          loading="lazy"
        />
      ) : (
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {service.title[lang]}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {service.description[lang]}
      </p>
    </div>
  );
}

export default function Services() {
  const { t, i18n } = useTranslation(['pages', 'common']);
  const lang = i18n.language as 'id' | 'en';

  const { data: services, isLoading, error } = useApi<Service[]>('/services');

  return (
    <>
      <SEOHead
        title={t('services.meta.title')}
        description={t('services.meta.description')}
        canonical="/services"
        schema={schema}
      />

      <PageHero
        page="services"
        titleKey="services.hero.title"
        subtitleKey="services.hero.subtitle"
      />

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          {isLoading && <Spinner />}
          {error && <ErrorAlert message={error} />}

          {!isLoading && !error && (!services || services.length === 0) && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-16">
              {t('services.empty')}
            </p>
          )}

          {services && services.length > 0 && (
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('services.cta.title')}
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {t('services.cta.body')}
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex btn-primary text-base px-8 py-4"
          >
            {t('cta.contactUs', { ns: 'common' })}
            <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

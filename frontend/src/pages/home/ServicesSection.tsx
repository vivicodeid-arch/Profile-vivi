import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useInView } from '../../hooks/useInView';
import { SERVICE_ICON_MAP } from '../../lib/constants';
import type { Service } from '../../types';

interface ServicesSectionProps {
  services: Service[];
}

/**
 * Services preview section on the Home page.
 * Shows up to 4 services as icon cards alongside a CMS-driven text column.
 */
export default function ServicesSection({ services }: ServicesSectionProps) {
  const { t, i18n } = useTranslation(['common', 'pages']);
  const lang = i18n.language as 'id' | 'en';
  const { settings } = useSettingsStore();
  const { ref, inView } = useInView(0.1);

  return (
    <section
      ref={ref}
      className="section-padding overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #90CAF9 0%, #E3F2FD 50%, #90CAF9 100%)' }}
      aria-labelledby="services-heading"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Text column */}
          <div
            className="order-2 lg:order-1 transition-all duration-700"
            style={{
              opacity:   inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <h3 className="text-primary-600 font-semibold text-lg mb-2">
              {settings.servicesSectionHomeSubtitle || t('home.services.subtitle', { ns: 'pages' })}
            </h3>
            <h2
              id="services-heading"
              className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-6" style={{ color: '#0D47A1' }}
            >
              {settings.servicesSectionHomeTitle || t('home.services.title', { ns: 'pages' })}
            </h2>

            <p className="mb-8 leading-relaxed" style={{ color: '#1565C0' }}>
              {settings.servicesSectionHomeDescription ||
                'Kami menyediakan solusi web development lengkap untuk kebutuhan bisnis Anda. Dapatkan website modern, cepat, dan SEO-friendly yang dirancang khusus untuk meningkatkan kehadiran online Anda.'}
            </p>

            {/* Service mini-cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {services.slice(0, 4).map(service => {
                const Icon = SERVICE_ICON_MAP[service.icon] ?? SERVICE_ICON_MAP.code;
                return (
                  <div
                    key={service.id}
                    className="flex items-start gap-3 p-3 rounded-lg shadow-sm border transition-all hover:-translate-y-1 hover:shadow-md"
                    style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: '#90CAF9' }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 self-center">
                      {service.title[lang]}
                    </h4>
                  </div>
                );
              })}
            </div>

            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              aria-label="Jelajahi Layanan Web Development Kami"
            >
              {t('cta.learnMore', { ns: 'common' })}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Image column */}
          <div
            className="relative order-1 lg:order-2 transition-all duration-1000"
            style={{
              opacity:   inView ? 1 : 0,
              transform: inView ? 'translateX(0)' : 'translateX(40px)',
            }}
          >
            <div className="absolute inset-0 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" style={{ backgroundColor: 'rgba(33,150,243,0.12)' }} />
            <img
              src={settings.servicesSectionHomeImage || '/hero-mockup.png'}
              alt="Layanan Kami"
              className="relative z-10 w-full h-auto object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

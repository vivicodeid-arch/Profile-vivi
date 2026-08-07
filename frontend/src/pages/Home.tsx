import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Code2, Globe, Smartphone, Search, Wrench, Palette } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { useSettingsStore } from '../store/settingsStore';
import api from '../services/api';
import type { Service } from '../types';

interface PricingPlan {
  id: string;
  name: string;
  label: Record<string, string>;
  subtitle: Record<string, string>;
  category: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  highlighted: boolean;
  ctaLabel: Record<string, string>;
  ctaUrl: string | null;
  badge: string | null;
  features: { id: string; text: Record<string, string>; included: boolean; order: number }[];
}
import PartnersSection from '../components/ui/PartnersSection';

const iconMap: Record<string, React.ElementType> = {
  globe: Globe, code: Code2, palette: Palette,
  search: Search, wrench: Wrench, smartphone: Smartphone,
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ViviDev.id',
  url: 'https://vividev.id',
  description: 'Jasa web developer profesional — website modern, cepat, dan SEO-friendly.',
  publisher: {
    '@type': 'Organization',
    name: 'ViviDev.id',
    url: 'https://vividev.id',
    contactPoint: { '@type': 'ContactPoint', telephone: '+62-857-9811-2370', contactType: 'customer service' },
  },
};


// CTA background slideshow — smooth crossfade dengan dua layer paralel
function CtaSlideshow({ images, intervalMs }: { images: string[]; intervalMs: number }) {
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const FADE_MS = 1000;

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % images.length);
        setTransitioning(false);
      }, FADE_MS);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  if (images.length === 0) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" aria-hidden="true" />
    );
  }

  const current = index % images.length;
  const next = (index + 1) % images.length;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Layer bawah: gambar berikutnya (selalu visible sebagai base) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${images[next]})` }}
      />
      {/* Layer atas: gambar sekarang, fade out saat transitioning */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${images[current]})`,
          opacity: transitioning ? 0 : 1,
          transition: transitioning ? `opacity ${FADE_MS}ms ease-in-out` : 'none',
        }}
      />
      {/* Overlay gelap supaya teks tetap terbaca */}
      <div className="absolute inset-0 bg-primary-900/70" />
    </div>
  );
}

// Floating particles component for hero background
function HeroParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 6,
    duration: Math.random() * 4 + 5,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-blue-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animation: `particle-drift ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
      {/* Grid lines subtle */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );
}

// Scroll-triggered animation hook
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// Count-up hook
function useCountUp(target: number, inView: boolean, duration = 1600) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return count;
}

// Stat item with count-up
function StatItem({ value, label, inView }: { value: string; label: string; inView: boolean }) {
  const isNumeric = /^(\d+)/.test(value);
  const numericPart = isNumeric ? parseInt(value) : 0;
  const suffix = value.replace(/^\d+/, '');
  const count = useCountUp(numericPart, inView);
  return (
    <div className="text-center group">
      <div className="text-4xl lg:text-5xl font-bold text-primary-500 tabular-nums transition-all duration-300 group-hover:scale-110">
        {isNumeric ? `${count}${suffix}` : value}
      </div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</div>
    </div>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation(['common', 'pages']);
  const lang = i18n.language as 'id' | 'en';
  const [services, setServices] = useState<Service[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const { settings } = useSettingsStore();
  const [heroVisible, setHeroVisible] = useState(false);

  const statsSection = useInView(0.2);
  const servicesSection = useInView(0.1);
  const ctaSection = useInView(0.2);
  const pricingSection = useInView(0.1);

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data.data || [])).catch(() => {});
    api.get('/pricing').then(r => setPlans(r.data.data || [])).catch(() => {});
    // Hero entrance with small delay
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    { value: '50+', label: t('home.stats.projects', { ns: 'pages' }) },
    { value: '40+', label: t('home.stats.clients', { ns: 'pages' }) },
    { value: '5+', label: t('home.stats.years', { ns: 'pages' }) },
    { value: '24/7', label: t('home.stats.support', { ns: 'pages' }) },
  ];

  const HeroTitle = () => {
    if (lang === 'en') {
      return (
        <>Build a{' '}<span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">Professional</span>{''} Website for Your Business</>
      );
    }
    return (
      <>Bangun Website{' '}<span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">Profesional</span>{''} untuk Bisnis Anda</>
    );
  };

  return (
    <>
      <SEOHead
        title="ViviDev.id — Jasa Web Developer Profesional"
        description="ViviDev.id menyediakan jasa pembuatan website profesional, aplikasi web, dan optimasi SEO untuk bisnis Anda."
        canonical="/"
        schema={orgSchema}
      />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-[linear-gradient(135deg,_#0a0f1e_0%,_#0d1635_30%,_#111d4a_55%,_#0f1d3e_75%,_#080d1a_100%)] text-white pt-20 overflow-hidden">
        {/* Radial glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(59,130,246,0.12)_0%,_transparent_60%),_radial-gradient(ellipse_at_80%_20%,_rgba(99,102,241,0.10)_0%,_transparent_55%),_radial-gradient(ellipse_at_60%_80%,_rgba(14,165,233,0.07)_0%,_transparent_50%)]" aria-hidden="true" />
        {/* Floating particles */}
        <HeroParticles />

        <div className="container-custom relative z-10 py-12 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text with stagger */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6 transition-all duration-700"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: '0ms',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-slow" />
                Web Developer Profesional
              </div>

              {/* H1 */}
              <h1
                className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 transition-all duration-700"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(28px)',
                  transitionDelay: '120ms',
                }}
              >
                <HeroTitle />
              </h1>

              {/* Subtitle */}
              <p
                className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-10 max-w-xl transition-all duration-700"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                  transitionDelay: '240ms',
                }}
              >
                {t('home.hero.subtitle', { ns: 'pages' })}
              </p>

              {/* CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-4 transition-all duration-700"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: '360ms',
                }}
              >
                <Link
                  to="/services"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base px-8 py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 w-fit"
                >
                  {t('nav.services', { ns: 'common' })}
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
                <Link
                  to="/portfolio"
                  className="border border-white/20 hover:border-white/40 text-white hover:bg-white/5 font-medium text-base px-8 py-4 rounded-full inline-flex items-center justify-center transition-all duration-200 hover:scale-105 w-fit"
                >
                  {t('nav.portfolio', { ns: 'common' })}
                </Link>
              </div>
            </div>

            {/* Right: Image with float animation */}
            <div
              className="relative w-full flex justify-center lg:justify-end mt-10 lg:mt-0 transition-all duration-1000"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateX(0)' : 'translateX(40px)',
                transitionDelay: '200ms',
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/20 blur-[100px] rounded-full animate-pulse-slow" />
              <img
                src={settings.heroImageUrl || '/hero-mockup.png'}
                alt="Website Mockup"
                className="relative z-10 w-full max-w-[600px] h-auto object-contain drop-shadow-2xl animate-float"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-all duration-700"
          style={{ opacity: heroVisible ? 0.6 : 0, transitionDelay: '800ms' }}
          aria-hidden="true"
        >
          <span className="text-xs text-gray-400 tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent animate-pulse-slow" />
        </div>
      </section>

      {/* Stats */}
      <section
        ref={statsSection.ref as React.RefObject<HTMLElement>}
        className="bg-white dark:bg-gray-900 py-16 shadow-sm dark:shadow-none border-b border-gray-100 dark:border-gray-800"
        aria-label="Statistics"
      >
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="transition-all duration-700"
                style={{
                  opacity: statsSection.inView ? 1 : 0,
                  transform: statsSection.inView ? 'translateY(0)' : 'translateY(24px)',
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <StatItem value={s.value} label={s.label} inView={statsSection.inView} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section
        ref={servicesSection.ref as React.RefObject<HTMLElement>}
        className="section-padding bg-gray-50 dark:bg-gray-950"
        aria-labelledby="services-heading"
      >
        <div className="container-custom">
          <div
            className="text-center transition-all duration-700"
            style={{
              opacity: servicesSection.inView ? 1 : 0,
              transform: servicesSection.inView ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <h2 id="services-heading" className="section-title">{t('home.services.title', { ns: 'pages' })}</h2>
            <p className="section-subtitle">{t('home.services.subtitle', { ns: 'pages' })}</p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service, i) => {
              const Icon = iconMap[service.icon] || Code2;
              return (
                <div
                  key={service.id}
                  className="card p-6 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-500 group cursor-default"
                  style={{
                    opacity: servicesSection.inView ? 1 : 0,
                    transform: servicesSection.inView ? 'translateY(0)' : 'translateY(32px)',
                    transitionDelay: `${i * 80 + 150}ms`,
                    transitionProperty: 'opacity, transform, box-shadow, scale',
                  }}
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {(service.title as Record<string, string>)[lang]}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {(service.description as Record<string, string>)[lang]}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            className="mt-12 text-center transition-all duration-700"
            style={{
              opacity: servicesSection.inView ? 1 : 0,
              transitionDelay: '600ms',
            }}
          >
            <Link to="/services" className="btn-outline hover:scale-105 transition-transform duration-200" aria-label="Jelajahi Layanan Web Development Kami">
              {t('cta.learnMore')} <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Partners / Klien Section */}
      <PartnersSection />


      {/* Pricing Preview Section */}
      <section
        ref={pricingSection.ref as React.RefObject<HTMLElement>}
        className="section-padding bg-white dark:bg-gray-900"
        aria-labelledby="pricing-heading"
      >
        <div
          className="container-custom transition-all duration-700"
          style={{
            opacity: pricingSection.inView ? 1 : 0,
            transform: pricingSection.inView ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <h2 id="pricing-heading" className="section-title">
            {t("home.pricing.title", { ns: "pages" })}
          </h2>
          <p className="section-subtitle">
            {t("home.pricing.subtitle", { ns: "pages" })}
          </p>

          {plans.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.slice(0, 3).map((plan) => {
                const price = plan.priceMonthly;
                const priceStr =
                  price === null
                    ? null
                    : price === 0
                    ? t("home.pricing.free", { ns: "pages" })
                    : new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: plan.currency || "IDR",
                        maximumFractionDigits: 0,
                      }).format(price);

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      plan.highlighted
                        ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/30"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {plan.badge && (
                      <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.highlighted ? "bg-white text-primary-600" : "bg-primary-600 text-white"
                      }`}>
                        {plan.badge}
                      </span>
                    )}
                    <h3 className={`text-lg font-bold ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>
                      {plan.label[lang] || plan.label.id || plan.name}
                    </h3>
                    <p className={`text-sm mt-1 ${plan.highlighted ? "text-primary-100" : "text-gray-500 dark:text-gray-400"}`}>
                      {plan.subtitle[lang] || plan.subtitle.id}
                    </p>
                    <div className="mt-4">
                      {priceStr ? (
                        <span>
                          <span className={`text-3xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>
                            {priceStr}
                          </span>
                          <span className={`text-sm ml-1 ${plan.highlighted ? "text-primary-100" : "text-gray-500 dark:text-gray-400"}`}>
                            {t("home.pricing.monthly", { ns: "pages" })}
                          </span>
                        </span>
                      ) : (
                        <span className={`text-3xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>
                          —
                        </span>
                      )}
                    </div>
                    <ul className="mt-4 space-y-2">
                      {plan.features.slice(0, 4).map((f) => (
                        <li key={f.id} className="flex items-center gap-2 text-sm">
                          <Check
                            className={`w-4 h-4 flex-shrink-0 ${
                              f.included
                                ? plan.highlighted ? "text-white" : "text-primary-600 dark:text-primary-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                          <span className={
                            f.included
                              ? plan.highlighted ? "text-white" : "text-gray-700 dark:text-gray-300"
                              : "text-gray-400 line-through"
                          }>
                            {f.text[lang] || f.text.id}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={plan.ctaUrl || "/pricing"}
                      className={`mt-6 block text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                        plan.highlighted
                          ? "bg-white text-primary-600 hover:bg-primary-50"
                          : "bg-primary-600 text-white hover:bg-primary-500"
                      }`}
                    >
                      {plan.ctaLabel[lang] || plan.ctaLabel.id || "Pilih Paket"}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              {t("home.pricing.viewAll", { ns: "pages" })}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaSection.ref as React.RefObject<HTMLElement>}
        className="section-padding bg-primary-700 text-white relative overflow-hidden"
        aria-labelledby="cta-heading"
      >
        {/* Background glow */}
        <CtaSlideshow
          images={settings.ctaSlideImages ? JSON.parse(settings.ctaSlideImages) : []}
          intervalMs={parseInt(settings.ctaSlideInterval || "4000")}
        />
        <div
          className="container-custom text-center relative z-10 transition-all duration-700"
          style={{
            opacity: ctaSection.inView ? 1 : 0,
            transform: ctaSection.inView ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          }}
        >
          <h2 id="cta-heading" className="text-3xl lg:text-4xl font-bold">
            {t('home.cta.title', { ns: 'pages' })}
          </h2>
          <p className="mt-4 text-lg text-primary-200 max-w-xl mx-auto">
            {t('home.cta.subtitle', { ns: 'pages' })}
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex btn-primary bg-white text-primary-700 hover:bg-primary-50 text-base px-8 py-4 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {t('home.cta.button', { ns: 'pages' })}
          </Link>
        </div>
      </section>
    </>
  );
}

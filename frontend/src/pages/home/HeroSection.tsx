import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Code2, Zap, Globe } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

// ---------------------------------------------------------------------------
// Particles — floating dots dalam palet biru
// ---------------------------------------------------------------------------
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 1.5,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 8,
  duration: Math.random() * 5 + 6,
  opacity: Math.random() * 0.35 + 0.1,
  color: ['#90CAF9', '#2196F3', '#E3F2FD'][Math.floor(Math.random() * 3)],
}));

function HeroParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(33,150,243,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(33,150,243,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Floating dots */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            backgroundColor: p.color,
            animation: `particle-drift ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature badge kecil di atas judul
// ---------------------------------------------------------------------------
const FEATURES = [
  { icon: Code2,  label: 'Custom Development' },
  { icon: Zap,    label: 'Fast & Optimized'   },
  { icon: Globe,  label: 'SEO Ready'          },
];

// ---------------------------------------------------------------------------
// HeroSection
// ---------------------------------------------------------------------------
export default function HeroSection() {
  const { t, i18n } = useTranslation(['common', 'pages']);
  const lang = i18n.language as 'id' | 'en';
  const { settings } = useSettingsStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const fadeIn = (delay: string): React.CSSProperties => ({
    opacity:         visible ? 1 : 0,
    transform:       visible ? 'translateY(0)' : 'translateY(28px)',
    transition:      'opacity 700ms, transform 700ms',
    transitionDelay: delay,
  });

  const heroTitle =
    lang === 'en' ? (
      <>
        Build a{' '}
        <span
          className="bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]"
          style={{ backgroundImage: 'linear-gradient(90deg, #90CAF9, #2196F3, #E3F2FD, #2196F3, #90CAF9)' }}
        >
          Professional
        </span>{' '}
        Website for Your Business
      </>
    ) : (
      <>
        Bangun Website{' '}
        <span
          className="bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]"
          style={{ backgroundImage: 'linear-gradient(90deg, #90CAF9, #2196F3, #E3F2FD, #2196F3, #90CAF9)' }}
        >
          Profesional
        </span>{' '}
        untuk Bisnis Anda
      </>
    );

  return (
    <section
      className="relative min-h-screen flex items-center text-white pt-20 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 25%, #1976D2 50%, #0D47A1 75%, #0a3880 100%)',
      }}
    >
      {/* Radial glows */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 15% 50%, rgba(33,150,243,0.25) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 15%, rgba(144,202,249,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 55% 85%, rgba(13,71,161,0.30) 0%, transparent 45%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Decorative large circle blur kiri */}
      <div
        className="absolute -left-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'rgba(33,150,243,0.12)' }}
        aria-hidden="true"
      />

      {/* Decorative large circle blur kanan */}
      <div
        className="absolute -right-40 bottom-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'rgba(144,202,249,0.08)' }}
        aria-hidden="true"
      />

      <HeroParticles />

      <div className="container-custom relative z-10 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: text ─────────────────────────────────────────────────── */}
          <div className="max-w-2xl">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border"
              style={{
                backgroundColor: 'rgba(144,202,249,0.12)',
                borderColor: 'rgba(144,202,249,0.30)',
                color: '#90CAF9',
                ...fadeIn('0ms'),
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse-slow"
                style={{ backgroundColor: '#2196F3' }}
              />
              Web Developer Profesional
            </div>

            {/* H1 */}
            <h1
              className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6"
              style={fadeIn('120ms')}
            >
              {heroTitle}
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg lg:text-xl leading-relaxed mb-8 max-w-xl"
              style={{ ...fadeIn('240ms'), color: '#90CAF9' }}
            >
              {t('home.hero.subtitle', { ns: 'pages' })}
            </p>

            {/* Feature pills */}
            <div
              className="flex flex-wrap gap-3 mb-10"
              style={fadeIn('300ms')}
            >
              {FEATURES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: 'rgba(33,150,243,0.10)',
                    borderColor: 'rgba(33,150,243,0.25)',
                    color: '#E3F2FD',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: '#2196F3' }} aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4" style={fadeIn('360ms')}>
              <Link
                to="/services"
                className="font-semibold text-base px-8 py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg w-fit"
                style={{
                  backgroundColor: '#2196F3',
                  color: '#fff',
                  boxShadow: '0 0 0 0 rgba(33,150,243,0)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#1976D2';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(33,150,243,0.4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#2196F3';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {t('nav.services', { ns: 'common' })}
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/portfolio"
                className="font-medium text-base px-8 py-4 rounded-full inline-flex items-center justify-center transition-all duration-200 hover:scale-105 w-fit border"
                style={{
                  borderColor: 'rgba(144,202,249,0.40)',
                  color: '#E3F2FD',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(144,202,249,0.10)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(144,202,249,0.70)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(144,202,249,0.40)';
                }}
              >
                {t('nav.portfolio', { ns: 'common' })}
              </Link>
            </div>
          </div>

          {/* ── Right: mockup image ─────────────────────────────────────────── */}
          <div
            className="relative w-full flex justify-center lg:justify-end mt-10 lg:mt-0"
            style={{
              opacity:         visible ? 1 : 0,
              transform:       visible ? 'translateX(0)' : 'translateX(40px)',
              transition:      'opacity 1000ms, transform 1000ms',
              transitionDelay: '200ms',
            }}
          >
            {/* Glow di belakang gambar */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full blur-[80px] animate-pulse-slow"
              style={{ backgroundColor: 'rgba(33,150,243,0.18)' }}
              aria-hidden="true"
            />

            {/* Ring dekoratif */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full border opacity-20"
              style={{ borderColor: '#2196F3' }}
              aria-hidden="true"
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] rounded-full border opacity-10"
              style={{ borderColor: '#90CAF9' }}
              aria-hidden="true"
            />

            <img
              src={settings.heroImageUrl || '/hero-mockup.png'}
              alt="Website Mockup"
              className="relative z-10 w-full max-w-[560px] h-auto object-contain drop-shadow-2xl animate-float"
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        style={{ opacity: visible ? 0.6 : 0, transition: 'opacity 700ms', transitionDelay: '900ms' }}
        aria-hidden="true"
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: '#90CAF9' }}>Scroll</span>
        <div
          className="w-px h-8 animate-pulse-slow"
          style={{ background: 'linear-gradient(to bottom, #2196F3, transparent)' }}
        />
      </div>

      {/* Wave divider bawah */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[40px]">
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            fill="white"
            className="dark:fill-gray-900"
          />
        </svg>
      </div>
    </section>
  );
}

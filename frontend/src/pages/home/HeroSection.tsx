import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

// ---------------------------------------------------------------------------
// HeroParticles — purely decorative floating dots
// ---------------------------------------------------------------------------

// Particles are generated once at module level so they don't re-randomise on
// every render. They are purely decorative, so a stable array is fine.
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 6,
  duration: Math.random() * 4 + 5,
  opacity: Math.random() * 0.4 + 0.1,
}));

function HeroParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-blue-400"
          style={{
            width:     p.size,
            height:    p.size,
            left:      `${p.left}%`,
            top:       `${p.top}%`,
            opacity:   p.opacity,
            animation: `particle-drift ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );
}

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

  const heroTitle =
    lang === 'en' ? (
      <>
        Build a{' '}
        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
          Professional
        </span>{' '}
        Website for Your Business
      </>
    ) : (
      <>
        Bangun Website{' '}
        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
          Profesional
        </span>{' '}
        untuk Bisnis Anda
      </>
    );

  const fadeIn = (delay: string): React.CSSProperties => ({
    opacity:          visible ? 1 : 0,
    transform:        visible ? 'translateY(0)' : 'translateY(24px)',
    transition:       'opacity 700ms, transform 700ms',
    transitionDelay:  delay,
  });

  return (
    <section className="relative min-h-screen flex items-center bg-[linear-gradient(135deg,_#0a0f1e_0%,_#0d1635_30%,_#111d4a_55%,_#0f1d3e_75%,_#080d1a_100%)] text-white pt-20 overflow-hidden">
      {/* Radial glows */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(59,130,246,0.12)_0%,_transparent_60%),_radial-gradient(ellipse_at_80%_20%,_rgba(99,102,241,0.10)_0%,_transparent_55%),_radial-gradient(ellipse_at_60%_80%,_rgba(14,165,233,0.07)_0%,_transparent_50%)]"
        aria-hidden="true"
      />
      <HeroParticles />

      <div className="container-custom relative z-10 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6"
              style={fadeIn('0ms')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-slow" />
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
              className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-10 max-w-xl"
              style={fadeIn('240ms')}
            >
              {t('home.hero.subtitle', { ns: 'pages' })}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4" style={fadeIn('360ms')}>
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

          {/* Right: mockup image */}
          <div
            className="relative w-full flex justify-center lg:justify-end mt-10 lg:mt-0"
            style={{
              opacity:         visible ? 1 : 0,
              transform:       visible ? 'translateX(0)' : 'translateX(40px)',
              transition:      'opacity 1000ms, transform 1000ms',
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{ opacity: visible ? 0.6 : 0, transition: 'opacity 700ms', transitionDelay: '800ms' }}
        aria-hidden="true"
      >
        <span className="text-xs text-gray-400 tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent animate-pulse-slow" />
      </div>
    </section>
  );
}

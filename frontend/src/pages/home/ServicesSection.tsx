import { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useInView } from '../../hooks/useInView';
import { SERVICE_ICON_MAP } from '../../lib/constants';
import { responsiveSrc } from '../../lib/images';
import { useTilt } from '../../hooks/useTilt';
import type { Service } from '../../types';

interface ServicesSectionProps {
  services: Service[];
}

// Position of each card (max 4) in a 2x2 diamond-like layout
// Values are percentages of the container (320x260)
const NODE_POSITIONS = [
  { x: 50,  y: 8  }, // top center
  { x: 88,  y: 50 }, // right
  { x: 50,  y: 88 }, // bottom center
  { x: 12,  y: 50 }, // left
];

// SVG connection lines between nodes (index pairs)
const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3],
];

/** Single card node with 3D tilt */
function ServiceNode({
  service,
  lang,
  position,
  index,
  inView,
}: {
  service: Service;
  lang: 'id' | 'en';
  position: { x: number; y: number };
  index: number;
  inView: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    // tilt only — no translate, so positioning wrapper is untouched
    el.style.transition = 'transform 0.08s ease-out, box-shadow 0.08s ease-out';
    el.style.transform  = `perspective(400px) rotateX(${-y * 18}deg) rotateY(${x * 18}deg) scale3d(1.1,1.1,1.1)`;
    el.style.boxShadow  = `${-x * 12}px ${-y * 12}px 32px rgba(33,150,243,0.35)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.45s ease-out, box-shadow 0.45s ease-out';
    el.style.transform  = 'perspective(400px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    el.style.boxShadow  = '';
  }, []);

  const Icon = SERVICE_ICON_MAP[service.icon] ?? SERVICE_ICON_MAP.code;

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top:  `${position.y}%`,
        transform:  inView
          ? 'translate(-50%, -50%)'
          : 'translate(-50%, calc(-50% + 20px))',
        opacity:    inView ? 1 : 0,
        transition: `opacity 600ms ease ${index * 150 + 200}ms, transform 600ms ease ${index * 150 + 200}ms`,
        zIndex: 10,
      }}
    >
      {/* Inner div: handles 3D tilt only */}
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        <div
          className="w-28 rounded-2xl border border-blue-200 bg-white/90 backdrop-blur-sm p-3 flex flex-col items-center gap-2 cursor-default select-none"
          style={{ boxShadow: '0 4px 20px rgba(33,150,243,0.15)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary-600" aria-hidden="true" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
            {service.title[lang]}
          </span>
        </div>
      </div>
    </div>
  );
}

/** SVG lines connecting the nodes */
function ConnectionLines({ inView }: { inView: boolean }) {
  // Compute pixel positions from percentages of the 320x260 container
  const W = 320, H = 260;
  const pts = NODE_POSITIONS.map(p => ({
    x: (p.x / 100) * W,
    y: (p.y / 100) * H,
  }));

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#2196F3" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#90CAF9" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {CONNECTIONS.map(([a, b], i) => (
        <line
          key={i}
          x1={pts[a]?.x} y1={pts[a]?.y}
          x2={pts[b]?.x} y2={pts[b]?.y}
          stroke="url(#line-grad)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          style={{
            opacity:    inView ? 0.7 : 0,
            transition: `opacity 800ms ease ${i * 100 + 400}ms`,
          }}
        />
      ))}
      {/* Pulsing dots at each node center */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y} r="3"
          fill="#2196F3"
          style={{
            opacity:    inView ? 0.6 : 0,
            transition: `opacity 600ms ease ${i * 120 + 300}ms`,
          }}
        />
      ))}
    </svg>
  );
}

/**
 * Services preview section on the Home page.
 * Shows up to 4 services as connected 3D node diagram.
 */
export default function ServicesSection({ services }: ServicesSectionProps) {
  const { t, i18n } = useTranslation(['common', 'pages']);
  const lang = i18n.language as 'id' | 'en';
  const { settings } = useSettingsStore();
  const { ref, inView } = useInView(0.1);
  const imgTilt = useTilt<HTMLDivElement>({ maxRotate: 12, scale: 1.03, perspective: 800 });

  const visibleServices = services.slice(0, 4);

  return (
    <section
      ref={ref}
      className="section-padding overflow-hidden lg:min-h-[700px]"
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
            <h2 className="text-primary-600 font-semibold text-lg mb-2">
              {settings.servicesSectionHomeSubtitle || t('home.services.subtitle', { ns: 'pages' })}
            </h2>
            <h2
              id="services-heading"
              className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-6"
              style={{ color: '#0D47A1' }}
            >
              {settings.servicesSectionHomeTitle || t('home.services.title', { ns: 'pages' })}
            </h2>

            <p className="mb-8 leading-relaxed" style={{ color: '#1565C0' }}>
              {settings.servicesSectionHomeDescription ||
                'Kami menyediakan solusi web development lengkap untuk kebutuhan bisnis Anda. Dapatkan website modern, cepat, dan SEO-friendly yang dirancang khusus untuk meningkatkan kehadiran online Anda.'}
            </p>

            {/* Connected node diagram */}
            <div
              className="relative mb-10 mx-auto"
              style={{ width: 320, height: 260 }}
            >
              {/* Subtle glow background */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(33,150,243,0.08) 0%, transparent 70%)',
                }}
              />
              <ConnectionLines inView={inView} />
              {visibleServices.map((service, i) => (
                <ServiceNode
                  key={service.id}
                  service={service}
                  lang={lang}
                  position={NODE_POSITIONS[i]}
                  index={i}
                  inView={inView}
                />
              ))}
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
            <div
              ref={imgTilt.ref}
              onMouseMove={imgTilt.onMouseMove}
              onMouseLeave={imgTilt.onMouseLeave}
              style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
            >
              <img
                {...responsiveSrc(settings.servicesSectionHomeImage || '/hero-mockup.png')}
                sizes="(max-width: 1024px) 100vw, 640px"
                alt="Layanan Kami"
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
                loading="lazy"
                width={800}
                height={640}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


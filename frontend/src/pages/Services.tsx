import { useRef, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import ErrorAlert from '../components/ui/ErrorAlert';
import { useApi } from '../hooks/useApi';
import { useInView } from '../hooks/useInView';
import { SERVICE_ICON_MAP, SITE_NAME } from '../lib/constants';
import type { Service } from '../types';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `Layanan — ${SITE_NAME}`,
  description: 'Layanan web development profesional dari ViviDev.id',
};

/** Compute positions for N nodes arranged in a circle */
function getCirclePositions(n: number, cx: number, cy: number, r: number) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

/** SVG connection lines between all nodes */
function ConnectionLines({
  positions,
  inView,
  width,
  height,
}: {
  positions: { x: number; y: number }[];
  inView: boolean;
  width: number;
  height: number;
}) {
  const connections: [number, number][] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      connections.push([i, j]);
    }
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="svc-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#2196F3" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#90CAF9" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {connections.map(([a, b], i) => {
        const pa = positions[a];
        const pb = positions[b];
        if (!pa || !pb) return null;
        return (
          <line
            key={i}
            x1={pa.x} y1={pa.y}
            x2={pb.x} y2={pb.y}
            stroke="url(#svc-line-grad)"
            strokeWidth="1.5"
            strokeDasharray="6 5"
            style={{
              opacity:    inView ? 0.6 : 0,
              transition: `opacity 600ms ease ${i * 40 + 300}ms`,
            }}
          />
        );
      })}
      {positions.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y} r="4"
          fill="#2196F3"
          style={{
            opacity:    inView ? 0.7 : 0,
            transition: `opacity 400ms ease ${i * 80 + 200}ms`,
          }}
        />
      ))}
    </svg>
  );
}

/** Single service card with 3D tilt */
function ServiceCard({
  service,
  lang,
  index,
  position,
  inView,
}: {
  service: Service;
  lang: 'id' | 'en';
  index: number;
  position: { x: number; y: number };
  inView: boolean;
}) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const Icon = SERVICE_ICON_MAP[service.icon] ?? SERVICE_ICON_MAP.code;

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    el.style.transition = 'transform 0.08s ease-out, box-shadow 0.08s ease-out';
    el.style.transform  = `perspective(500px) rotateX(${-y * 16}deg) rotateY(${x * 16}deg) scale3d(1.08,1.08,1.08)`;
    el.style.boxShadow  = `${-x * 14}px ${-y * 14}px 36px rgba(33,150,243,0.30)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.45s ease-out, box-shadow 0.45s ease-out';
    el.style.transform  = 'perspective(500px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    el.style.boxShadow  = '0 4px 20px rgba(33,150,243,0.12)';
  }, []);

  return (
    <div
      className="absolute"
      style={{
        left:       position.x,
        top:        position.y,
        transform:  inView
          ? 'translate(-50%, -50%)'
          : 'translate(-50%, calc(-50% + 24px))',
        opacity:    inView ? 1 : 0,
        transition: `opacity 600ms ease ${index * 120 + 200}ms, transform 600ms ease ${index * 120 + 200}ms`,
        zIndex:     10,
      }}
    >
      {/* Inner: 3D tilt only */}
      <div
        ref={tiltRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        <div
          className="w-36 rounded-2xl border border-blue-100 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-4 flex flex-col items-center gap-2 cursor-default select-none"
          style={{ boxShadow: '0 4px 20px rgba(33,150,243,0.12)' }}
        >
          {service.imageUrl ? (
            <img
              src={service.imageUrl}
              alt={service.title[lang]}
              className="w-10 h-10 object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
          )}
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center leading-tight">
            {service.title[lang]}
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-relaxed line-clamp-3">
            {service.description[lang]}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Diagram canvas — positions cards in a circle with SVG connections */
function ServiceDiagram({
  services,
  lang,
}: {
  services: Service[];
  lang: 'id' | 'en';
}) {
  const { ref, inView } = useInView(0.1);
  const [size, setSize] = useState({ w: 700, h: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setSize({ w, h: Math.max(w * 0.75, 400) });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cx = size.w / 2;
  const cy = size.h / 2;
  const r  = Math.min(cx, cy) * 0.65;
  const positions = getCirclePositions(services.length, cx, cy, r);

  return (
    <div
      ref={el => {
        // assign both refs
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      className="relative w-full"
      style={{ height: size.h }}
    >
      <ConnectionLines
        positions={positions}
        inView={inView}
        width={size.w}
        height={size.h}
      />
      {services.map((service, i) => (
        <ServiceCard
          key={service.id}
          service={service}
          lang={lang}
          index={i}
          position={positions[i]}
          inView={inView}
        />
      ))}
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

      <section
        className="section-padding overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #E3F2FD 0%, #ffffff 50%, #E3F2FD 100%)' }}
      >
        <div className="container-custom">
          {isLoading && <Spinner />}
          {error && <ErrorAlert message={error} />}

          {!isLoading && !error && (!services || services.length === 0) && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-16">
              {t('services.empty')}
            </p>
          )}

          {services && services.length > 0 && (
            <ServiceDiagram services={services} lang={lang} />
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

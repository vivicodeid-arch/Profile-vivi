import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/settingsStore';
import { useInView } from '../../hooks/useInView';
import { getOptUrl } from '../../lib/images';

const FADE_MS = 1000;

interface CtaSlideshowProps {
  images: string[];
  intervalMs: number;
}

/**
 * Smooth crossfade slideshow used as the CTA section background.
 * Uses two absolutely-positioned layers alternating opacity to avoid flicker.
 */
function CtaSlideshow({ images, intervalMs }: CtaSlideshowProps) {
  const [index, setIndex]             = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    // Use viewport width to pick optimized image size: 640px on mobile, 1200px on desktop
    const timer = setInterval(() => {
      setTransitioning(true);
      // Store timeout id so we can clear it on unmount to prevent setState on unmounted component
      const fadeTimer = setTimeout(() => {
        setIndex(i => (i + 1) % images.length);
        setTransitioning(false);
      }, FADE_MS);
      return () => clearTimeout(fadeTimer);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  if (images.length === 0) {
    return (
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]"
        aria-hidden="true"
      />
    );
  }

  const current = index % images.length;
  const next    = (index + 1) % images.length;

  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity"
        style={{
          backgroundImage: `url(${getOptUrl(images[current], 1200)})`,
          opacity:         transitioning ? 0 : 1,
          transitionDuration: `${FADE_MS}ms`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity"
        style={{
          backgroundImage: `url(${getOptUrl(images[next], 1200)})`,
          opacity:         transitioning ? 1 : 0,
          transitionDuration: `${FADE_MS}ms`,
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(13,71,161,0.75)' }} aria-hidden="true" />
    </>
  );
}

// ---------------------------------------------------------------------------
// CtaSection
// ---------------------------------------------------------------------------

export default function CtaSection() {
  const { t } = useTranslation(['pages']);
  const { settings } = useSettingsStore();
  const { ref, inView } = useInView(0.2);

  const images      = JSON.parse(settings.ctaSlideImages  || '[]') as string[];
  const intervalMs  = parseInt(settings.ctaSlideInterval  || '5000', 10);

  return (
    <section
      ref={ref}
      className="relative section-padding text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #2196F3 70%, #0D47A1 100%)' }}
      aria-labelledby="cta-heading"
    >
      <CtaSlideshow images={images} intervalMs={intervalMs} />

      <div
        className="container-custom text-center relative z-10 transition-opacity duration-700"
        style={{
          opacity: inView ? 1 : 0,
        }}
      >
        <h2 id="cta-heading" className="text-3xl lg:text-4xl font-bold">
          {t('home.cta.title')}
        </h2>
        <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: '#90CAF9' }}>
          {t('home.cta.subtitle')}
        </p>
        <Link
          to="/contact"
          className="mt-8 inline-flex btn-primary text-base px-8 py-4 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold rounded-full"
          style={{ backgroundColor: '#E3F2FD', color: '#0D47A1' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#90CAF9'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#E3F2FD'; }}
        >
          {t('home.cta.button')}
        </Link>
      </div>
    </section>
  );
}

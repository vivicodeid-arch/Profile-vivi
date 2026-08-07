import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/settingsStore';
import { POSITION_CSS, type HeroPosition, type HeroType } from '../../lib/constants';

interface PageHeroProps {
  /** Which settings key prefix to read, e.g. "about" → reads aboutHeroType, etc. */
  page: 'about' | 'blog' | 'contact' | 'portfolio' | 'services' | 'pricing';
  /** i18n fallback key for the title, e.g. "about.hero.title" */
  titleKey: string;
  /** i18n fallback key for the subtitle */
  subtitleKey: string;
}

/**
 * Reusable page hero section.
 *
 * Reads hero config (type / url / title / subtitle / position) from settingsStore
 * using the `page` prefix, then falls back to i18n strings when the CMS value is empty.
 *
 * Supported hero types:
 *  - "gradient"  → purple-to-indigo CSS gradient (default)
 *  - "image"     → full-bleed background image
 *  - "video"     → autoplaying muted video
 */
export default function PageHero({ page, titleKey, subtitleKey }: PageHeroProps) {
  const { settings } = useSettingsStore();
  const { t } = useTranslation(['pages']);

  const heroType = (settings[`${page}HeroType`] || 'gradient') as HeroType;
  const heroUrl  = settings[`${page}HeroUrl`]  || '';
  const title    = settings[`${page}HeroTitle`]    || t(titleKey);
  const subtitle = settings[`${page}HeroSubtitle`] || t(subtitleKey);
  const positionKey = (settings[`${page}HeroPosition`] || 'center') as HeroPosition;
  const position = POSITION_CSS[positionKey] ?? 'center center';

  const textContent = (
    <div className="container-custom relative z-10">
      <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
      <p className="text-lg text-white/80 max-w-2xl">{subtitle}</p>
    </div>
  );

  const baseClass = 'relative pt-32 pb-16 text-white overflow-hidden min-h-[220px]';
  const overlay   = <div className="absolute inset-0 bg-black/50" aria-hidden="true" />;

  if (heroType === 'image' && heroUrl) {
    return (
      <section className={baseClass}>
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${heroUrl})`, backgroundPosition: position }}
          aria-hidden="true"
        />
        {overlay}
        {textContent}
      </section>
    );
  }

  if (heroType === 'video' && heroUrl) {
    return (
      <section className={baseClass}>
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
        {overlay}
        {textContent}
      </section>
    );
  }

  // Default: gradient
  return (
    <section className={`${baseClass} bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700`}>
      {textContent}
    </section>
  );
}

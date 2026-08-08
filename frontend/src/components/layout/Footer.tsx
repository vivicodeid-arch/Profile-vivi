import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { SUPPORT_EMAIL, WA_NUMBER } from '../../lib/constants';
import { getOptUrl } from '../../lib/images';

const NAV_LINKS = [
  { to: '/',          key: 'nav.home'      },
  { to: '/about',     key: 'nav.about'     },
  { to: '/services',  key: 'nav.services'  },
  { to: '/portfolio', key: 'nav.portfolio' },
  { to: '/blog',      key: 'nav.blog'      },
  { to: '/contact',   key: 'nav.contact'   },
];

export default function Footer() {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const year = new Date().getFullYear();

  // Prefer CMS values, fall back to compile-time constants.
  // No isLoading check needed — settingsStore.isLoading starts as false and
  // DEFAULT_SETTINGS already provides safe values for every key.
  // Values update in-place when the API responds → zero layout shift.
  const email   = settings.contactEmail   || SUPPORT_EMAIL;
  const phone   = settings.contactPhone   || '+62 857-9811-2370';
  const waNum   = settings.contactWaNumber || WA_NUMBER;
  const address = settings.contactAddress || 'Indonesia';

  return (
    // content-visibility:auto tells the browser it can skip rendering this
    // element while it is off-screen, freeing main-thread time for LCP.
    // contain-intrinsic-size provides a size estimate so the layout engine
    // can reserve space without actually rendering the subtree.
    <footer
      className="text-gray-100 min-h-[300px]"
      style={{
        backgroundColor: '#0B1849',
        // Reinforce min-height as an inline style so the browser enforces it
        // immediately when React hydrates, regardless of when the Tailwind CSS
        // bundle is parsed. The app-shell footer placeholder in index.html uses
        // the same 300px value, so the reserved space is continuous across the
        // pre-hydration → post-hydration transition with no shift.
        minHeight: '300px',
      }}
    >
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="min-h-[120px]">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4 h-8">
              {/* Always render <img> so the layout box is stable before and after
                  fetchSettings() resolves. Switching between <img> and <Code2+span>
                  changes the element tree and height, causing a layout shift at
                  ~310 ms when logoUrl arrives from the CMS — the primary CLS culprit.
                  Fallback to /favicon.png so the img is never a blank slot. */}
              <img
                src={settings.logoUrl ? getOptUrl(settings.logoUrl, 320) : '/favicon.png'}
                alt={settings.siteName || 'ViviDev.id'}
                className="h-full max-w-[140px] object-contain"
                width={140}
                height={32}
                loading="eager"
              />
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.links')}</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info — driven by settingsStore */}
          <div className="min-h-[150px]">
            <h3 className="text-white font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true" />
                <a href={`mailto:${email}`} className="hover:text-primary-400 transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true" />
                <a
                  href={`https://wa.me/${waNum}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 min-h-[64px]">
          <p>© {year} {settings.siteName || 'ViviDev.id'}. {t('footer.rights')}</p>
          <div className="flex gap-4">
            {/* Use <a> not <Link> — sitemap.xml is a static file served by the
                web server, not a React route. Link would do a client-side
                navigation that returns 404 from the SPA router. */}
            <a href="/sitemap.xml" className="hover:text-white transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

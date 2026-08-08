import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Code2, Mail, Phone, MapPin } from 'lucide-react';
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
  const { settings, isLoading } = useSettingsStore();
  const year = new Date().getFullYear();

  // Prefer CMS values, fall back to compile-time constants
  const email   = settings.contactEmail   || SUPPORT_EMAIL;
  const phone   = settings.contactPhone   || '+62 857-9811-2370';
  const waNum   = settings.contactWaNumber || WA_NUMBER;
  const address = settings.contactAddress || 'Indonesia';

  return (
    <footer className="text-gray-100" style={{ backgroundColor: '#0B1849' }}>
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="min-h-[120px]">
            {isLoading ? (
              <div className="h-8 w-32 bg-white/10 animate-pulse rounded mb-4" />
            ) : (
              <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4 h-8">
                {settings.logoUrl ? (
                  <img
                    src={getOptUrl(settings.logoUrl, 320)}
                    alt={settings.siteName || 'Logo'}
                    className="h-full max-w-[140px] object-contain"
                    width={140}
                    height={32}
                  />
                ) : (
                  <>
                    <Code2 className="w-6 h-6 text-primary-400" aria-hidden="true" />
                    <span>
                      {settings.siteName || 'ViviDev'}
                      <span className="text-primary-400">.id</span>
                    </span>
                  </>
                )}
              </Link>
            )}
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
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/10 rounded shrink-0" />
                  <div className="h-4 w-40 bg-white/10 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/10 rounded shrink-0" />
                  <div className="h-4 w-32 bg-white/10 rounded" />
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-white/10 rounded shrink-0 mt-0.5" />
                  <div className="h-10 w-full max-w-[200px] bg-white/10 rounded" />
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 min-h-[64px]">
          <p>© {year} {isLoading ? 'ViviDev.id' : (settings.siteName || 'ViviDev.id')}. {t('footer.rights')}</p>
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

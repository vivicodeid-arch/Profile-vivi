import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Code2, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/services', label: t('nav.services') },
    { to: '/portfolio', label: t('nav.portfolio') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <Code2 className="w-6 h-6 text-primary-400" aria-hidden="true" />
              <span>ViviDev<span className="text-primary-400">.id</span></span>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.links')}</h3>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true" />
                <a href="mailto:support@vividev.id" className="hover:text-primary-400 transition-colors">
                  support@vividev.id
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true" />
                <a href="https://wa.me/6285798112370" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  +62 857-9811-2370
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {year} ViviDev.id. {t('footer.rights')}</p>
          <div className="flex gap-4">
            <Link to="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

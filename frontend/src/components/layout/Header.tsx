import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Code2, Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useThemeStore } from '../../store/themeStore';

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSettingsStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id');
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/services', label: t('nav.services') },
    { to: '/portfolio', label: t('nav.portfolio') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-2 font-bold text-xl transition-colors ${
              scrolled ? 'text-primary-700 dark:text-white' : 'text-white'
            }`}
          >
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName || 'Logo'} className="h-[34px] max-w-[158px] object-contain" />
            ) : (
              <>
                <Code2 className="w-7 h-7" aria-hidden="true" />
                <span>{settings.siteName ? settings.siteName : <>ViviDev<span className={scrolled ? 'text-primary-400' : 'text-primary-300'}>.id</span></>}</span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? (scrolled ? 'text-primary-700 bg-primary-50 dark:text-white dark:bg-white/20' : 'text-white bg-white/20')
                    : (scrolled ? 'text-gray-600 hover:text-primary-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800' : 'text-white/80 hover:text-white hover:bg-white/10')
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`p-2 rounded-lg transition-colors ${
                scrolled
                  ? 'text-gray-600 hover:text-primary-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>

            {/* Language switcher */}
            <button
              onClick={toggleLang}
              aria-label="Switch language"
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scrolled
                  ? 'text-gray-600 hover:text-primary-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              <span>{i18n.language === 'id' ? 'EN' : 'ID'}</span>
            </button>

            {/* CTA Button (desktop) */}
            <Link to="/contact" className="hidden lg:inline-flex btn-primary text-sm px-4 py-2">
              {t('cta.contactUs')}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' : 'text-white hover:bg-white/10'
              }`}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg">
          <nav className="container-custom py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-primary-700 bg-primary-50 dark:text-white dark:bg-white/20'
                    : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/contact" className="mt-2 btn-primary text-sm text-center">
              {t('cta.contactUs')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

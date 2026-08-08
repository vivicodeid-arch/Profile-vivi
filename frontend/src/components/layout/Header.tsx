import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Code2, Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useThemeStore } from '../../store/themeStore';
import { getOptUrl } from '../../lib/images';

/** Renders the site name with a dynamic 3D extrusion text-shadow that
 *  follows the mouse cursor for a depth illusion. */
function Logo3DText({ siteName }: { siteName?: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [shadow, setShadow] = useState('');
  // Track pending rAF to avoid queuing more than one frame at a time
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Throttle to one rAF per frame — prevents flooding the main thread on
    // every mousemove event (which can fire 100+ times/sec)
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = spanRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-20, Math.min(20, (e.clientX - cx) * 0.25));
      const dy = Math.max(-20, Math.min(20, (e.clientY - cy) * 0.25));
      const layers = Array.from({ length: 6 }, (_, i) => {
        const depth = i + 1;
        const alpha = 0.55 - i * 0.08;
        return `${(dx * depth) / 6}px ${(dy * depth) / 6}px 0 rgba(0,0,0,${alpha})`;
      });
      setShadow(layers.join(', '));
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setShadow('');
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <span
      ref={spanRef}
      style={{
        textShadow: shadow,
        transition: shadow ? 'none' : 'text-shadow 0.4s ease',
        display: 'inline-block',
      }}
    >
      {siteName ?? (
        <>
          ViviDev
          <span style={{ color: '#90CAF9' }}>.id</span>
        </>
      )}
    </span>
  );
}

/** Wraps any element with a local mouse-tracking 3D tilt effect. */
function Tilt3D({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // position of cursor relative to element center, normalized -1..1
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    const rotY =  x * 25;
    const rotX = -y * 20;
    el.style.transition = 'transform 0.08s ease-out';
    el.style.transform = `perspective(300px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.12,1.12,1.12)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.4s ease-out';
    el.style.transform = 'perspective(300px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', display: 'inline-block' }}
    >
      {children}
    </div>
  );
}

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { settings } = useSettingsStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const handler = () => {
      const currentY = window.scrollY;
      // hide when scrolling down past 80px, show when scrolling up
      if (currentY > 80) {
        setVisible(currentY < lastScrollY.current);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handler, { passive: true });
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
      className={`fixed top-4 left-0 right-0 z-40 transition-all duration-300 px-4 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="container-custom mx-auto max-w-6xl">
        <div className="bg-white dark:bg-gray-900 rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1),0_6px_0_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3),0_6px_0_rgba(255,255,255,0.05)] border border-gray-100 dark:border-gray-800 flex items-center justify-between h-14 lg:h-16 px-4 lg:px-6 transition-all duration-300">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-xl transition-colors text-gray-900 dark:text-white"
            >
              {settings.logoUrl ? (
                <Tilt3D>
                  <img src={getOptUrl(settings.logoUrl, 320)} alt={settings.siteName || 'Logo'} className="h-[28px] max-w-[130px] object-contain" width={200} height={50} />
                </Tilt3D>
              ) : (
                <>
                  <Code2 className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  <Logo3DText siteName={settings.siteName} />
                </>
              )}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center justify-center gap-1 flex-1" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-primary-700 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-full transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>

            {/* Language switcher */}
            <button
              onClick={toggleLang}
              aria-label="Switch language"
              className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              <span>{i18n.language === 'id' ? 'EN' : 'ID'}</span>
            </button>

            {/* CTA Button (desktop) */}
            <Link to="/contact" className="hidden lg:inline-flex bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-sm hover:shadow">
              {t('cta.contactUs')}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="lg:hidden p-2 rounded-full transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="lg:hidden mt-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
            <nav className="p-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(link.to)
                      ? 'text-primary-700 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30'
                      : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/contact" className="mt-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors text-center">
                {t('cta.contactUs')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { useSettingsStore } from './store/settingsStore';
import { useThemeStore } from './store/themeStore';
import PageTransition from './components/PageTransition';
import Spinner from './components/ui/Spinner';

// Public layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/layout/WhatsAppButton';

// ---------------------------------------------------------------------------
// Lazy-loaded public pages
// ---------------------------------------------------------------------------
const Home      = lazy(() => import('./pages/Home'));
const About     = lazy(() => import('./pages/About'));
const Services  = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Blog      = lazy(() => import('./pages/Blog'));
const BlogPost  = lazy(() => import('./pages/BlogPost'));
const Contact   = lazy(() => import('./pages/Contact'));
const Pricing   = lazy(() => import('./pages/Pricing'));

// ---------------------------------------------------------------------------
// Lazy-loaded admin pages
// ---------------------------------------------------------------------------
const AdminLogin       = lazy(() => import('./admin/AdminLogin'));
const AdminLayout      = lazy(() => import('./admin/AdminLayout'));
const Dashboard        = lazy(() => import('./admin/Dashboard'));
const BlogEditor       = lazy(() => import('./admin/BlogEditor'));
const PortfolioManager = lazy(() => import('./admin/PortfolioManager'));
const ServiceManager   = lazy(() => import('./admin/ServiceManager'));
const TeamManager      = lazy(() => import('./admin/TeamManager'));
const MediaManager     = lazy(() => import('./admin/MediaManager'));
const SettingsManager  = lazy(() => import('./admin/SettingsManager'));
const AboutManager     = lazy(() => import('./admin/AboutManager'));
const PartnerManager   = lazy(() => import('./admin/PartnerManager'));
const PricingManager   = lazy(() => import('./admin/PricingManager'));

// ---------------------------------------------------------------------------
// Layout wrappers
// ---------------------------------------------------------------------------

function PageLoader() {
  return <Spinner className="min-h-[60vh]" />;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header & Footer are eagerly imported — they render immediately without
          waiting for the lazy page chunk to resolve, which keeps the shell
          visible during navigation and prevents blank-screen flashes. */}
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400">404</h1>
      <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
        Halaman tidak ditemukan
      </p>
      <Link to="/" className="mt-6 btn-primary">
        Kembali ke Beranda
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith('/admin');

  const { fetchSettings } = useSettingsStore();
  const { theme }         = useThemeStore();

  // Sync dark-mode class on <html>
  // Admin pages: always dark (all admin components styled for dark mode)
  // Public pages: follow user theme preference
  useEffect(() => {
    if (isAdmin) {
      document.documentElement.classList.add('dark');
      return;
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, isAdmin]);

  // Fetch CMS settings once on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <Suspense fallback={<PageLoader />}>
      {isAdmin ? (
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index                element={<Dashboard />} />
            <Route path="blog"          element={<BlogEditor />} />
            <Route path="portfolio"     element={<PortfolioManager />} />
            <Route path="services"      element={<ServiceManager />} />
            <Route path="team"          element={<TeamManager />} />
            <Route path="media"         element={<MediaManager />} />
            <Route path="settings"      element={<SettingsManager />} />
            <Route path="about"         element={<AboutManager />} />
            <Route path="partners"      element={<PartnerManager />} />
            <Route path="pricing"       element={<PricingManager />} />
          </Route>
        </Routes>
      ) : (
        <PublicLayout>
          <PageTransition locationKey={location.key}>
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/about"       element={<About />} />
              <Route path="/services"    element={<Services />} />
              <Route path="/portfolio"   element={<Portfolio />} />
              <Route path="/blog"        element={<Blog />} />
              <Route path="/blog/:slug"  element={<BlogPost />} />
              <Route path="/contact"     element={<Contact />} />
              <Route path="/pricing"     element={<Pricing />} />
              <Route path="*"            element={<NotFound />} />
            </Routes>
          </PageTransition>
        </PublicLayout>
      )}
    </Suspense>
  );
}

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import api from './services/api';
import { useSettingsStore } from './store/settingsStore';
import { useThemeStore } from './store/themeStore';
import PageTransition from './components/PageTransition';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/layout/WhatsAppButton';

// Lazy-loaded public pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));

// Lazy-loaded admin pages
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const BlogEditor = lazy(() => import('./admin/BlogEditor'));
const PortfolioManager = lazy(() => import('./admin/PortfolioManager'));
const ServiceManager = lazy(() => import('./admin/ServiceManager'));
const TeamManager = lazy(() => import('./admin/TeamManager'));
const MediaManager = lazy(() => import('./admin/MediaManager'));
const SettingsManager = lazy(() => import('./admin/SettingsManager'));
const AboutManager = lazy(() => import('./admin/AboutManager'));
const PartnerManager = lazy(() => import('./admin/PartnerManager'));
const PricingManager = lazy(() => import('./admin/PricingManager'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
  </div>
);

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
    <WhatsAppButton />
  </>
);

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { fetchSettings, settings } = useSettingsStore();
  const { theme } = useThemeStore();

  // Apply dark class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings.faviconUrl]);

  // Track page views
  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) {
      api.post('/analytics/track', {
        path: location.pathname,
        referrer: document.referrer || undefined,
      }).catch(() => {});
    }
  }, [location.pathname]);

  return (
    <Suspense fallback={<PageLoader />}>
      {isAdmin ? (
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<PageTransition locationKey={location.key}><Dashboard /></PageTransition>} />
            <Route path="blog" element={<PageTransition locationKey={location.key}><BlogEditor /></PageTransition>} />
            <Route path="portfolio" element={<PageTransition locationKey={location.key}><PortfolioManager /></PageTransition>} />
            <Route path="services" element={<PageTransition locationKey={location.key}><ServiceManager /></PageTransition>} />
            <Route path="team" element={<PageTransition locationKey={location.key}><TeamManager /></PageTransition>} />
            <Route path="media" element={<PageTransition locationKey={location.key}><MediaManager /></PageTransition>} />
            <Route path="settings" element={<PageTransition locationKey={location.key}><SettingsManager /></PageTransition>} />
            <Route path="partners" element={<PageTransition locationKey={location.key}><PartnerManager /></PageTransition>} />
            <Route path="pricing" element={<PageTransition locationKey={location.key}><PricingManager /></PageTransition>} />
            <Route path="about" element={<PageTransition locationKey={location.key}><AboutManager /></PageTransition>} />
          </Route>
        </Routes>
      ) : (
        <PublicLayout>
          <PageTransition locationKey={location.key}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <h1 className="text-6xl font-bold text-primary-600">404</h1>
                  <p className="mt-4 text-xl text-gray-600">Halaman tidak ditemukan</p>
                  <a href="/" className="mt-6 btn-primary">Kembali ke Beranda</a>
                </div>
              } />
            </Routes>
          </PageTransition>
        </PublicLayout>
      )}
    </Suspense>
  );
}

export default App;

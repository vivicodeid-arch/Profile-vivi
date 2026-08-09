import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import PageTransition from './components/PageTransition';
import Spinner from './components/ui/Spinner';
import ProtectedRoute from './components/ProtectedRoute';

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

// PublicShell renders Header/Footer/WhatsApp as stable DOM nodes that are
// never unmounted — even while Suspense shows a fallback for lazy pages.
// This keeps the footer in the layout at all times, preventing CLS.
// It hides itself on /admin/* routes via CSS visibility so it doesn't
// interfere with the admin layout while remaining in the DOM.
function PublicShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hidden on admin, but stays in DOM to avoid layout shift */}
      {!isAdmin && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {/* Footer reserved space is always in the DOM on public routes.
          min-h-[300px] matches the footer placeholder in index.html. */}
      {!isAdmin && (
        <>
          <Footer />
          <WhatsAppButton />
        </>
      )}
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

// AdminThemeSync — komponen terpisah agar tidak merusak logika routing
function AdminThemeSync() {
  const location = useLocation();
  const { theme } = useThemeStore();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      document.documentElement.classList.add('dark');
      return;
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, isAdmin]);

  return null;
}

export default function App() {
  const location = useLocation();

  // NOTE: fetchSettings() tidak lagi dipanggil di sini.
  // settingsStore.ts sudah melakukan auto-fetch saat store dibuat (di luar
  // komponen), sehingga fetch dimulai lebih awal — sebelum React render tree.
  // Double call via useEffect + auto-fetch menyebabkan 2 request berurutan
  // dan membuang bandwidth pada first visit.

  return (
    <Suspense fallback={<PageLoader />}>
      <AdminThemeSync />
      <PublicShell>
        <Routes>
          {/* ----------------------------------------------------------------
              Admin routes — PublicShell menyembunyikan Header/Footer di /admin
          ---------------------------------------------------------------- */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
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
          </Route>

          {/* ----------------------------------------------------------------
              Public routes — Header/Footer sudah ada di PublicShell di atas
          ---------------------------------------------------------------- */}
          <Route path="/"            element={<PageTransition locationKey={location.key}><Home /></PageTransition>} />
          <Route path="/about"       element={<PageTransition locationKey={location.key}><About /></PageTransition>} />
          <Route path="/services"    element={<PageTransition locationKey={location.key}><Services /></PageTransition>} />
          <Route path="/portfolio"   element={<PageTransition locationKey={location.key}><Portfolio /></PageTransition>} />
          <Route path="/blog"        element={<PageTransition locationKey={location.key}><Blog /></PageTransition>} />
          <Route path="/blog/:slug"  element={<PageTransition locationKey={location.key}><BlogPost /></PageTransition>} />
          <Route path="/contact"     element={<PageTransition locationKey={location.key}><Contact /></PageTransition>} />
          <Route path="/pricing"     element={<PageTransition locationKey={location.key}><Pricing /></PageTransition>} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </PublicShell>
    </Suspense>
  );
}

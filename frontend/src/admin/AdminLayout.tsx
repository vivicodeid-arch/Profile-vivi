import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Code2, LayoutDashboard, FileText, Briefcase, Settings as SettingsIcon, Sliders, Users, Image as ImageIcon, LogOut, Menu, X, Handshake, Tag, Info, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/about', label: 'About Page', icon: Info },
  { to: '/admin/blog', label: 'Blog', icon: FileText },
  { to: '/admin/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/admin/services', label: 'Services', icon: SettingsIcon },
  { to: '/admin/team', label: 'Team', icon: Users },
  { to: '/admin/media', label: 'Media', icon: ImageIcon },
  { to: '/admin/partners', label: 'Partners', icon: Handshake },
  { to: '/admin/pricing', label: 'Pricing', icon: Tag },
  { to: '/admin/settings', label: 'Gen. Settings', icon: Sliders },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore();
  const { adminTheme, toggleAdminTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth().then(() => {
      if (!isAuthenticated) navigate('/admin/login', { replace: true });
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className={`min-h-screen flex ${adminTheme === 'dark' ? 'dark' : ''}`} style={{ backgroundColor: adminTheme === 'dark' ? '#0D1B2A' : '#F0F4FF' }}>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#0D47A1', borderRight: '1px solid #1565C0' }}
      >
        <div className="flex items-center justify-between h-16 px-6" style={{ borderBottom: '1px solid #1565C0' }}>
          <NavLink to="/admin" className="flex items-center gap-2 font-bold text-lg text-white">
            <Code2 className="w-6 h-6" style={{ color: '#90CAF9' }} aria-hidden="true" />
            <span>ViviDev<span style={{ color: '#90CAF9' }}>.id</span></span>
          </NavLink>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-blue-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1" aria-label="Admin navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-blue-800'
                  : 'text-blue-100 hover:text-white hover:bg-blue-700'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid #1565C0' }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-blue-900 text-sm font-bold" style={{ backgroundColor: '#90CAF9' }}>
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-blue-300">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-200 hover:text-white hover:bg-red-600 transition-colors">
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 flex items-center px-6 lg:px-8"
          style={{
            backgroundColor: adminTheme === 'dark' ? '#132F4C' : '#FFFFFF',
            borderBottom: `1px solid ${adminTheme === 'dark' ? '#1565C0' : '#BBDEFB'}`,
          }}
        >
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 hover:text-blue-600" style={{ color: '#1565C0' }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleAdminTheme}
              title={adminTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{
                color: adminTheme === 'dark' ? '#90CAF9' : '#1565C0',
                border: `1px solid ${adminTheme === 'dark' ? '#1565C0' : '#BBDEFB'}`,
                backgroundColor: 'transparent',
              }}
            >
              {adminTheme === 'dark'
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
              }
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="text-xs transition-colors hover:text-blue-800" style={{ color: '#2196F3' }}>
              Lihat Website →
            </a>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

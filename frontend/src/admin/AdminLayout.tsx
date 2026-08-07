import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Code2, LayoutDashboard, FileText, Briefcase, Settings as SettingsIcon, Sliders, Users, Image as ImageIcon, LogOut, Menu, X, Handshake, Tag, Info } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../store/authStore';

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
    <div className="min-h-screen bg-gray-950 flex">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <NavLink to="/admin" className="flex items-center gap-2 font-bold text-lg text-white">
            <Code2 className="w-6 h-6 text-primary-400" aria-hidden="true" />
            <span>ViviDev<span className="text-primary-400">.id</span></span>
          </NavLink>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1" aria-label="Admin navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="ml-auto text-xs text-gray-500 hover:text-primary-400 transition-colors">
            Lihat Website →
          </a>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

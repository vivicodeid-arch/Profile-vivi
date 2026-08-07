import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch {
      setError('Email atau password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#E3F2FD' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold mb-2" style={{ color: '#0D47A1' }}>
            <Code2 className="w-8 h-8" style={{ color: '#2196F3' }} aria-hidden="true" />
            ViviDev<span style={{ color: '#2196F3' }}>.id</span>
          </div>
          <p className="text-sm" style={{ color: '#1565C0' }}>Admin Panel</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ border: '1px solid #BBDEFB' }}>
          <h1 className="text-xl font-semibold mb-6" style={{ color: '#0D47A1' }}>Masuk ke Dashboard</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#1565C0' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#90CAF9' }} aria-hidden="true" />
                <input
                  id="email" type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#F8FBFF',
                    border: '1px solid #90CAF9',
                    color: '#0D47A1',
                  }}
                  placeholder="admin@vividev.id"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#1565C0' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#90CAF9' }} aria-hidden="true" />
                <input
                  id="password" type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#F8FBFF',
                    border: '1px solid #90CAF9',
                    color: '#0D47A1',
                  }}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80" style={{ color: '#90CAF9' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading || !email || !password}
              className="w-full py-3 font-semibold rounded-lg text-sm transition-colors text-white disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0D47A1' }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = '#1565C0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#0D47A1'; }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Masuk...
                </span>
              ) : 'Masuk'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs mt-6" style={{ color: '#90CAF9' }}>© {new Date().getFullYear()} ViviDev.id</p>
      </div>
    </div>
  );
}

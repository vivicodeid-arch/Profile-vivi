import { useEffect, useState } from 'react';
import { Eye, MessageSquare, TrendingUp, Users } from 'lucide-react';
import api from '../services/api';
import type { AnalyticsSummary } from '../types';

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/summary')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>
  );

  const stats = [
    { label: 'Views Hari Ini', value: data?.pageViews.today ?? 0, icon: Eye, bg: 'bg-blue-500/20', text: 'text-blue-400' },
    { label: 'Views 7 Hari', value: data?.pageViews.last7Days ?? 0, icon: TrendingUp, bg: 'bg-green-500/20', text: 'text-green-400' },
    { label: 'Views 30 Hari', value: data?.pageViews.last30Days ?? 0, icon: Users, bg: 'bg-purple-500/20', text: 'text-purple-400' },
    { label: 'Pesan Belum Dibaca', value: data?.contacts.unread ?? 0, icon: MessageSquare, bg: 'bg-orange-500/20', text: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Selamat datang di Admin Panel ViviDev.id</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">{label}</p>
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${text}`} aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Halaman Terpopuler (30 hari)</h2>
          {data?.topPages.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada data.</p>
          ) : (
            <div className="space-y-3">
              {data?.topPages.map(p => (
                <div key={p.path} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate max-w-[200px]">{p.path}</span>
                  <span className="text-sm font-medium text-primary-400">{p.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Trend */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Tren Harian (7 hari)</h2>
          {data?.dailyTrend.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada data.</p>
          ) : (
            <div className="space-y-2">
              {data?.dailyTrend.map(d => {
                const max = Math.max(...(data?.dailyTrend.map(x => x.count) || [1]));
                const pct = max > 0 ? (d.count / max) * 100 : 0;
                return (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24 shrink-0">{d.date}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{d.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contact Stats */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Contact Form</h2>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-3xl font-bold text-white">{data?.contacts.total ?? 0}</p>
            <p className="text-sm text-gray-400 mt-1">Total Pesan</p>
          </div>
          <div className="h-12 w-px bg-gray-800" />
          <div>
            <p className="text-3xl font-bold text-orange-400">{data?.contacts.unread ?? 0}</p>
            <p className="text-sm text-gray-400 mt-1">Belum Dibaca</p>
          </div>
        </div>
      </div>
    </div>
  );
}

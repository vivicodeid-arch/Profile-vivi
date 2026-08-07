import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Pencil, Trash2, GripVertical, X, Check } from 'lucide-react';
import api from '../services/api';

interface PricingFeature {
  id?: string;
  text: { id: string; en: string };
  included: boolean;
  order: number;
}

interface PricingPlan {
  id: string;
  name: string;
  label: { id: string; en: string };
  subtitle: { id: string; en: string };
  category: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  highlighted: boolean;
  ctaLabel: { id: string; en: string };
  ctaUrl: string | null;
  badge: string | null;
  active: boolean;
  order: number;
  features: PricingFeature[];
}

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

const emptyPlan = (): Omit<PricingPlan, 'id'> => ({
  name: '',
  label: { id: '', en: '' },
  subtitle: { id: '', en: '' },
  category: 'individual',
  priceMonthly: null,
  priceYearly: null,
  currency: 'IDR',
  highlighted: false,
  ctaLabel: { id: '', en: '' },
  ctaUrl: null,
  badge: null,
  active: true,
  order: 0,
  features: [],
});

export default function PricingManager() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PricingPlan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/pricing/all')
      .then(r => setPlans(r.data.data || []))
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleNew = () => {
    setEditing({ id: '', ...emptyPlan() });
    setIsNew(true);
    setError('');
  };

  const handleEdit = (plan: PricingPlan) => {
    setEditing({ ...plan });
    setIsNew(false);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus paket ini?')) return;
    try {
      await api.delete(`/pricing/${id}`);
      load();
    } catch {
      setError('Gagal menghapus');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      if (isNew) {
        await api.post('/pricing', editing);
      } else {
        await api.put(`/pricing/${editing.id}`, editing);
      }
      setEditing(null);
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      features: [
        ...editing.features,
        { text: { id: '', en: '' }, included: true, order: editing.features.length },
      ],
    });
  };

  const removeFeature = (i: number) => {
    if (!editing) return;
    setEditing({ ...editing, features: editing.features.filter((_, idx) => idx !== i) });
  };

  const updateFeature = (i: number, patch: Partial<PricingFeature>) => {
    if (!editing) return;
    setEditing({
      ...editing,
      features: editing.features.map((f, idx) => idx === i ? { ...f, ...patch } : f),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manajemen Pricing</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Paket
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-400 rounded-lg text-sm">{error}</div>
      )}

      <div className="space-y-3">
        {plans.map(plan => (
          <div key={plan.id} className="flex items-center gap-4 bg-gray-900 rounded-xl p-4 border border-gray-800">
            <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">{plan.label.id || plan.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{plan.category}</span>
                {plan.highlighted && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-900/50 text-primary-400">Highlighted</span>}
                {!plan.active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400">Nonaktif</span>}
              </div>
              <p className="text-sm text-gray-500 mt-0.5 truncate">{plan.subtitle.id}</p>
              <p className="text-xs text-gray-600 mt-1">
                {plan.features.length} fitur · {plan.priceMonthly !== null ? `${plan.currency} ${plan.priceMonthly?.toLocaleString('id-ID')}/bln` : 'Hubungi Kami'}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleEdit(plan)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Pencil className="w-4 h-4 text-gray-400" />
              </button>
              <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-red-900/20 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="text-center text-gray-500 py-32 min-h-[60vh] flex flex-col items-center justify-center bg-gray-900 rounded-xl border border-gray-800">
            <p>Belum ada paket pricing.</p>
            <p className="text-sm mt-1">Klik "Tambah Paket" untuk mulai.</p>
          </div>
        )}
      </div>

      {/* Modal — rendered via portal to avoid transform stacking context */}
      {editing && createPortal(
        <div
          className="fixed inset-0 z-[200] bg-black/60 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
        >
          <div className="min-h-full flex items-start justify-center py-8 px-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-700">

              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900 rounded-t-2xl">
                <h2 className="text-lg font-semibold text-white">
                  {isNew ? 'Tambah Paket Baru' : 'Edit Paket'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body — scrolls naturally inside the page */}
              <div className="p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-700 text-red-400 rounded-lg text-sm">{error}</div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Nama Internal</label>
                    <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className={inputCls} placeholder="starter" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Kategori</label>
                    <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className={inputCls}>
                      <option value="individual">Individual</option>
                      <option value="team">Tim & Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Label (ID)</label>
                    <input value={editing.label.id} onChange={e => setEditing({ ...editing, label: { ...editing.label, id: e.target.value } })} className={inputCls} placeholder="Starter" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Label (EN)</label>
                    <input value={editing.label.en} onChange={e => setEditing({ ...editing, label: { ...editing.label, en: e.target.value } })} className={inputCls} placeholder="Starter" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Subtitle (ID)</label>
                    <input value={editing.subtitle.id} onChange={e => setEditing({ ...editing, subtitle: { ...editing.subtitle, id: e.target.value } })} className={inputCls} placeholder="Untuk personal" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Subtitle (EN)</label>
                    <input value={editing.subtitle.en} onChange={e => setEditing({ ...editing, subtitle: { ...editing.subtitle, en: e.target.value } })} className={inputCls} placeholder="For personal use" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Harga/Bulan</label>
                    <input type="number" value={editing.priceMonthly ?? ''} onChange={e => setEditing({ ...editing, priceMonthly: e.target.value === '' ? null : Number(e.target.value) })} className={inputCls} placeholder="0 = Gratis" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Harga/Tahun</label>
                    <input type="number" value={editing.priceYearly ?? ''} onChange={e => setEditing({ ...editing, priceYearly: e.target.value === '' ? null : Number(e.target.value) })} className={inputCls} placeholder="Opsional" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Mata Uang</label>
                    <input value={editing.currency} onChange={e => setEditing({ ...editing, currency: e.target.value })} className={inputCls} placeholder="IDR" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Teks Tombol (ID)</label>
                    <input value={editing.ctaLabel.id} onChange={e => setEditing({ ...editing, ctaLabel: { ...editing.ctaLabel, id: e.target.value } })} className={inputCls} placeholder="Mulai Sekarang" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Teks Tombol (EN)</label>
                    <input value={editing.ctaLabel.en} onChange={e => setEditing({ ...editing, ctaLabel: { ...editing.ctaLabel, en: e.target.value } })} className={inputCls} placeholder="Get Started" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">URL Tombol</label>
                    <input value={editing.ctaUrl ?? ''} onChange={e => setEditing({ ...editing, ctaUrl: e.target.value || null })} className={inputCls} placeholder="/contact" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Badge (opsional)</label>
                    <input value={editing.badge ?? ''} onChange={e => setEditing({ ...editing, badge: e.target.value || null })} className={inputCls} placeholder="Paling Populer" />
                  </div>
                </div>

                <div className="flex items-end gap-6">
                  <div className="w-32">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Urutan</label>
                    <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: Number(e.target.value) })} className={inputCls} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={editing.highlighted} onChange={e => setEditing({ ...editing, highlighted: e.target.checked })} className="w-4 h-4 accent-primary-500" />
                    <span className="text-sm text-gray-300">Highlighted</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 accent-primary-500" />
                    <span className="text-sm text-gray-300">Aktif</span>
                  </label>
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-400">Fitur-fitur</label>
                    <button onClick={addFeature} className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                      <Plus className="w-3 h-3" /> Tambah Fitur
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editing.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          onClick={() => updateFeature(i, { included: !f.included })}
                          className={`shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${f.included ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-500'}`}
                        >
                          {f.included && <Check className="w-3 h-3" />}
                        </button>
                        <input value={f.text.id} onChange={e => updateFeature(i, { text: { ...f.text, id: e.target.value } })} className={inputCls} placeholder="Teks fitur (ID)" />
                        <input value={f.text.en} onChange={e => updateFeature(i, { text: { ...f.text, en: e.target.value } })} className={inputCls} placeholder="Feature text (EN)" />
                        <button onClick={() => removeFeature(i)} className="shrink-0 p-1.5 hover:bg-red-900/20 rounded-lg transition-colors">
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                    {editing.features.length === 0 && (
                      <p className="text-xs text-gray-600 py-2">Belum ada fitur. Klik "Tambah Fitur" di atas.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t border-gray-700 bg-gray-900 rounded-b-2xl">
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  Batal
                </button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>

            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}

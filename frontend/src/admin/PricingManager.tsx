import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Pencil, Trash2, GripVertical, X, Check } from 'lucide-react';
import api from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LocalizedText {
  id: string;
  en: string;
}

interface PricingFeature {
  id?: string;
  text: LocalizedText;
  included: boolean;
  order: number;
}

interface PricingPlan {
  id: string;
  name: string;
  label: LocalizedText;
  subtitle: LocalizedText;
  category: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  highlighted: boolean;
  ctaLabel: LocalizedText;
  ctaUrl: string | null;
  badge: string | null;
  active: boolean;
  order: number;
  features: PricingFeature[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

const labelCls = 'block text-xs font-medium text-gray-400 mb-1.5';

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

function usePricingManager() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PricingPlan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/pricing/all')
      .then((r) => setPlans(r.data.data || []))
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({ id: '', ...emptyPlan() });
    setIsNew(true);
    setError('');
  };

  const openEdit = (plan: PricingPlan) => {
    setEditing({ ...plan });
    setIsNew(false);
    setError('');
  };

  const closeModal = () => setEditing(null);

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
      closeModal();
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const patchEditing = (patch: Partial<PricingPlan>) => {
    setEditing((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const addFeature = () => {
    if (!editing) return;
    patchEditing({
      features: [
        ...editing.features,
        { text: { id: '', en: '' }, included: true, order: editing.features.length },
      ],
    });
  };

  const removeFeature = (index: number) => {
    if (!editing) return;
    patchEditing({ features: editing.features.filter((_, i) => i !== index) });
  };

  const updateFeature = (index: number, patch: Partial<PricingFeature>) => {
    if (!editing) return;
    patchEditing({
      features: editing.features.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    });
  };

  return {
    plans,
    loading,
    editing,
    isNew,
    saving,
    error,
    openNew,
    openEdit,
    closeModal,
    handleDelete,
    handleSave,
    patchEditing,
    addFeature,
    removeFeature,
    updateFeature,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-3 bg-red-900/30 border border-red-700 text-red-400 rounded-lg text-sm">
      {message}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

interface PlanCardProps {
  plan: PricingPlan;
  onEdit: (plan: PricingPlan) => void;
  onDelete: (id: string) => void;
}

function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
  const priceLabel =
    plan.priceMonthly !== null
      ? `${plan.currency} ${plan.priceMonthly?.toLocaleString('id-ID')}/bln`
      : 'Hubungi Kami';

  return (
    <div className="flex items-center gap-4 bg-gray-900 rounded-xl p-4 border border-gray-800">
      <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white">{plan.label.id || plan.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
            {plan.category}
          </span>
          {plan.highlighted && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-900/50 text-primary-400">
              Highlighted
            </span>
          )}
          {!plan.active && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400">
              Nonaktif
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5 truncate">{plan.subtitle.id}</p>
        <p className="text-xs text-gray-600 mt-1">
          {plan.features.length} fitur · {priceLabel}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(plan)}
          aria-label="Edit paket"
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          aria-label="Hapus paket"
          className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

interface FeatureListProps {
  features: PricingFeature[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<PricingFeature>) => void;
}

function FeatureList({ features, onAdd, onRemove, onUpdate }: FeatureListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={labelCls}>Fitur-fitur</label>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
        >
          <Plus className="w-3 h-3" /> Tambah Fitur
        </button>
      </div>

      <div className="space-y-2">
        {features.length === 0 ? (
          <p className="text-xs text-gray-600 py-2">
            Belum ada fitur. Klik "Tambah Fitur" di atas.
          </p>
        ) : (
          features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => onUpdate(i, { included: !f.included })}
                aria-label={f.included ? 'Tandai tidak termasuk' : 'Tandai termasuk'}
                className={`shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  f.included ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-500'
                }`}
              >
                {f.included && <Check className="w-3 h-3" />}
              </button>
              <input
                value={f.text.id}
                onChange={(e) => onUpdate(i, { text: { ...f.text, id: e.target.value } })}
                className={inputCls}
                placeholder="Teks fitur (ID)"
              />
              <input
                value={f.text.en}
                onChange={(e) => onUpdate(i, { text: { ...f.text, en: e.target.value } })}
                className={inputCls}
                placeholder="Feature text (EN)"
              />
              <button
                onClick={() => onRemove(i)}
                aria-label="Hapus fitur"
                className="shrink-0 p-1.5 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface PricingModalProps {
  editing: PricingPlan;
  isNew: boolean;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: () => void;
  onChange: (patch: Partial<PricingPlan>) => void;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
  onUpdateFeature: (index: number, patch: Partial<PricingFeature>) => void;
}

function PricingModal({
  editing,
  isNew,
  saving,
  error,
  onClose,
  onSave,
  onChange,
  onAddFeature,
  onRemoveFeature,
  onUpdateFeature,
}: PricingModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black/60 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="min-h-full flex items-start justify-center py-8 px-4">
        <div className="bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-700">

          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900 rounded-t-2xl">
            <h2 className="text-lg font-semibold text-white">
              {isNew ? 'Tambah Paket Baru' : 'Edit Paket'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Tutup modal"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {error && <ErrorBanner message={error} />}

            {/* Nama & Kategori */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nama Internal</label>
                <input
                  value={editing.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  className={inputCls}
                  placeholder="starter"
                />
              </div>
              <div>
                <label className={labelCls}>Kategori</label>
                <select
                  value={editing.category}
                  onChange={(e) => onChange({ category: e.target.value })}
                  className={inputCls}
                >
                  <option value="individual">Individual</option>
                  <option value="team">Tim &amp; Enterprise</option>
                </select>
              </div>
            </div>

            {/* Label */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Label (ID)</label>
                <input
                  value={editing.label.id}
                  onChange={(e) => onChange({ label: { ...editing.label, id: e.target.value } })}
                  className={inputCls}
                  placeholder="Starter"
                />
              </div>
              <div>
                <label className={labelCls}>Label (EN)</label>
                <input
                  value={editing.label.en}
                  onChange={(e) => onChange({ label: { ...editing.label, en: e.target.value } })}
                  className={inputCls}
                  placeholder="Starter"
                />
              </div>
            </div>

            {/* Subtitle */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Subtitle (ID)</label>
                <input
                  value={editing.subtitle.id}
                  onChange={(e) =>
                    onChange({ subtitle: { ...editing.subtitle, id: e.target.value } })
                  }
                  className={inputCls}
                  placeholder="Untuk personal"
                />
              </div>
              <div>
                <label className={labelCls}>Subtitle (EN)</label>
                <input
                  value={editing.subtitle.en}
                  onChange={(e) =>
                    onChange({ subtitle: { ...editing.subtitle, en: e.target.value } })
                  }
                  className={inputCls}
                  placeholder="For personal use"
                />
              </div>
            </div>

            {/* Harga */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Harga/Bulan</label>
                <input
                  type="number"
                  value={editing.priceMonthly ?? ''}
                  onChange={(e) =>
                    onChange({ priceMonthly: e.target.value === '' ? null : Number(e.target.value) })
                  }
                  className={inputCls}
                  placeholder="0 = Gratis"
                />
              </div>
              <div>
                <label className={labelCls}>Harga/Tahun</label>
                <input
                  type="number"
                  value={editing.priceYearly ?? ''}
                  onChange={(e) =>
                    onChange({ priceYearly: e.target.value === '' ? null : Number(e.target.value) })
                  }
                  className={inputCls}
                  placeholder="Opsional"
                />
              </div>
              <div>
                <label className={labelCls}>Mata Uang</label>
                <input
                  value={editing.currency}
                  onChange={(e) => onChange({ currency: e.target.value })}
                  className={inputCls}
                  placeholder="IDR"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Teks Tombol (ID)</label>
                <input
                  value={editing.ctaLabel.id}
                  onChange={(e) =>
                    onChange({ ctaLabel: { ...editing.ctaLabel, id: e.target.value } })
                  }
                  className={inputCls}
                  placeholder="Mulai Sekarang"
                />
              </div>
              <div>
                <label className={labelCls}>Teks Tombol (EN)</label>
                <input
                  value={editing.ctaLabel.en}
                  onChange={(e) =>
                    onChange({ ctaLabel: { ...editing.ctaLabel, en: e.target.value } })
                  }
                  className={inputCls}
                  placeholder="Get Started"
                />
              </div>
            </div>

            {/* URL & Badge */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>URL Tombol</label>
                <input
                  value={editing.ctaUrl ?? ''}
                  onChange={(e) => onChange({ ctaUrl: e.target.value || null })}
                  className={inputCls}
                  placeholder="/contact"
                />
              </div>
              <div>
                <label className={labelCls}>Badge (opsional)</label>
                <input
                  value={editing.badge ?? ''}
                  onChange={(e) => onChange({ badge: e.target.value || null })}
                  className={inputCls}
                  placeholder="Paling Populer"
                />
              </div>
            </div>

            {/* Urutan & Toggle */}
            <div className="flex items-end gap-6">
              <div className="w-32">
                <label className={labelCls}>Urutan</label>
                <input
                  type="number"
                  value={editing.order}
                  onChange={(e) => onChange({ order: Number(e.target.value) })}
                  className={inputCls}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={editing.highlighted}
                  onChange={(e) => onChange({ highlighted: e.target.checked })}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm text-gray-300">Highlighted</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => onChange({ active: e.target.checked })}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm text-gray-300">Aktif</span>
              </label>
            </div>

            {/* Features */}
            <FeatureList
              features={editing.features}
              onAdd={onAddFeature}
              onRemove={onRemoveFeature}
              onUpdate={onUpdateFeature}
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t border-gray-700 bg-gray-900 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PricingManager() {
  const {
    plans,
    loading,
    editing,
    isNew,
    saving,
    error,
    openNew,
    openEdit,
    closeModal,
    handleDelete,
    handleSave,
    patchEditing,
    addFeature,
    removeFeature,
    updateFeature,
  } = usePricingManager();

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manajemen Pricing</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Paket
        </button>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {/* Plan list */}
      <div className="space-y-3">
        {plans.length === 0 ? (
          <div className="text-center text-gray-500 py-32 min-h-[60vh] flex flex-col items-center justify-center bg-gray-900 rounded-xl border border-gray-800">
            <p>Belum ada paket pricing.</p>
            <p className="text-sm mt-1">Klik "Tambah Paket" untuk mulai.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modal */}
      {editing && (
        <PricingModal
          editing={editing}
          isNew={isNew}
          saving={saving}
          error={error}
          onClose={closeModal}
          onSave={handleSave}
          onChange={patchEditing}
          onAddFeature={addFeature}
          onRemoveFeature={removeFeature}
          onUpdateFeature={updateFeature}
        />
      )}
    </div>
  );
}

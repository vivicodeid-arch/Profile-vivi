import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Star } from 'lucide-react';
import api from '../services/api';
import type { Portfolio } from '../types';
import LangTabs from '../components/admin/LangTabs';
import ImageUploadField from '../components/admin/ImageUploadField';
import ErrorAlert from '../components/ui/ErrorAlert';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Lang = 'id' | 'en';

type Category = 'company' | 'ecommerce' | 'webapp' | 'landing';

const CATEGORIES: Category[] = ['company', 'ecommerce', 'webapp', 'landing'];

interface PortfolioForm {
  title:       Record<Lang, string>;
  description: Record<Lang, string>;
  category:    Category;
  imageUrl:    string;
  projectUrl:  string;
  techStack:   string[];
  featured:    boolean;
  order:       number;
}

const EMPTY_FORM: PortfolioForm = {
  title:       { id: '', en: '' },
  description: { id: '', en: '' },
  category:    'company',
  imageUrl:    '',
  projectUrl:  '',
  techStack:   [],
  featured:    false,
  order:       0,
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(form: PortfolioForm): string | null {
  if (!form.title.id.trim())       return 'Judul (ID) wajib diisi.';
  if (!form.imageUrl.trim())       return 'Gambar wajib diupload.';
  return null;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PortfolioManager() {
  const [items, setItems]       = useState<Portfolio[]>([]);
  const [form, setForm]         = useState<PortfolioForm | null>(null);
  const [editId, setEditId]     = useState<string | null>(null);
  const [lang, setLang]         = useState<Lang>('id');
  const [techInput, setTechInput] = useState('');
  const [isSaving, setSaving]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  const fetchItems = () => {
    api.get('/portfolio')
      .then(r => setItems(r.data.data ?? []))
      .catch(() => {});
  };

  useEffect(() => { fetchItems(); }, []);

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  const openNew = () => {
    setForm({ ...EMPTY_FORM, title: { id: '', en: '' }, description: { id: '', en: '' }, techStack: [] });
    setEditId(null);
    setError(null);
  };

  const openEdit = (item: Portfolio) => {
    setError(null);
    setForm({
      title:       item.title       as Record<Lang, string>,
      description: item.description as Record<Lang, string>,
      category:    item.category    as Category,
      imageUrl:    item.imageUrl,
      projectUrl:  item.projectUrl ?? '',
      techStack:   [...item.techStack],
      featured:    item.featured,
      order:       item.order,
    });
    setEditId(item.id);
  };

  const closeForm = () => { setForm(null); setEditId(null); setError(null); };

  const setBilingualField = (
    field: 'title' | 'description',
    value: string,
  ) => setForm(prev => prev ? { ...prev, [field]: { ...prev[field], [lang]: value } } : prev);

  const addTech = () => {
    const val = techInput.trim();
    if (!val || !form) return;
    if (!form.techStack.includes(val)) {
      setForm(prev => prev ? { ...prev, techStack: [...prev.techStack, val] } : prev);
    }
    setTechInput('');
  };

  const removeTech = (tech: string) => {
    setForm(prev => prev ? { ...prev, techStack: prev.techStack.filter(t => t !== tech) } : prev);
  };

  // ---------------------------------------------------------------------------
  // Save / Delete
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    if (!form) return;
    const err = validate(form);
    if (err) { setError(err); return; }

    setSaving(true);
    setError(null);
    try {
      if (editId) {
        await api.put(`/portfolio/${editId}`, form);
      } else {
        await api.post('/portfolio', form);
      }
      fetchItems();
      closeForm();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal menyimpan item.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus item portfolio ini?')) return;
    try {
      await api.delete(`/portfolio/${id}`);
      fetchItems();
    } catch {
      setError('Gagal menghapus item.');
    }
  };

  // ---------------------------------------------------------------------------
  // Render: edit form
  // ---------------------------------------------------------------------------

  if (form) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            {editId ? 'Edit Portfolio' : 'Tambah Portfolio'}
          </h1>
          <button onClick={closeForm} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <ErrorAlert message={error} />}

        <LangTabs active={lang} onChange={setLang} />

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Judul ({lang.toUpperCase()}) *
          </label>
          <input
            type="text"
            value={form.title[lang]}
            onChange={e => setBilingualField('title', e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Deskripsi ({lang.toUpperCase()})
          </label>
          <textarea
            rows={4}
            value={form.description[lang]}
            onChange={e => setBilingualField('description', e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Category & Order */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Kategori</label>
            <select
              value={form.category}
              onChange={e => setForm(prev => prev ? { ...prev, category: e.target.value as Category } : prev)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Urutan</label>
            <input
              type="number"
              value={form.order}
              onChange={e => setForm(prev => prev ? { ...prev, order: Number(e.target.value) } : prev)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Project URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">URL Project</label>
          <input
            type="url"
            value={form.projectUrl}
            onChange={e => setForm(prev => prev ? { ...prev, projectUrl: e.target.value } : prev)}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Image upload */}
        <ImageUploadField
          label="Gambar Portfolio *"
          value={form.imageUrl}
          onChange={url => setForm(prev => prev ? { ...prev, imageUrl: url } : prev)}
          altText={form.title.id || 'portfolio'}
          onError={setError}
        />

        {/* Tech stack */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Tech Stack</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={techInput}
              onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
              placeholder="React, Node.js, …"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={addTech}
              className="rounded-lg bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700"
            >
              Tambah
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.techStack.map(tech => (
              <span key={tech} className="flex items-center gap-1 rounded-full bg-primary-900/50 px-2.5 py-1 text-xs text-primary-300">
                {tech}
                <button type="button" onClick={() => removeTech(tech)} className="ml-0.5 text-primary-400 hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Featured toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setForm(prev => prev ? { ...prev, featured: !prev.featured } : prev)}
            className={`relative w-10 h-5 rounded-full transition-colors ${form.featured ? 'bg-amber-500' : 'bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : ''}`} />
          </div>
          <span className="flex items-center gap-1.5 text-sm text-gray-300">
            <Star className={`w-4 h-4 ${form.featured ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />
            {form.featured ? 'Featured' : 'Biasa'}
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan…' : 'Simpan'}
          </button>
          <button
            onClick={closeForm}
            className="rounded-lg border border-gray-600 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800"
          >
            Batal
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: grid list
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {error && <ErrorAlert message={error} />}

      {items.length === 0 ? (
        <p className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">
          Belum ada item portfolio.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => {
            const titleId = (item.title as Record<string, string>).id;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden"
              >
                <div className="relative h-32 bg-gray-800">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={titleId}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {item.featured && (
                    <span className="absolute top-2 left-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-white truncate">{titleId}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                  <div className="mt-3 flex justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-900/20 hover:text-red-400"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

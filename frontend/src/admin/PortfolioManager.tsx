import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, Star, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import type { Portfolio } from '../types';

const empty = {
  title: { id: '', en: '' }, description: { id: '', en: '' },
  category: 'company', imageUrl: '', projectUrl: '',
  techStack: [] as string[], featured: false, order: 0,
};

export default function PortfolioManager() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = () => api.get('/portfolio').then(r => setItems(r.data.data || [])).catch(() => {});
  useEffect(() => { fetchItems(); }, []);

  const startEdit = (item: Portfolio) => {
    setError(null);
    setEditing({
      title: item.title as { id: string; en: string },
      description: item.description as { id: string; en: string },
      category: item.category, imageUrl: item.imageUrl,
      projectUrl: item.projectUrl || '', techStack: item.techStack,
      featured: item.featured, order: item.order,
    });
    setEditId(item.id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('alt', editing.title.id || 'portfolio');

      const response = await api.post('/media', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status === 'ok') {
        setEditing(p => p ? { ...p, imageUrl: response.data.data.url } : p);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengupload gambar.');
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);

    // Frontend validation
    if (!editing.title.id.trim()) { setError('Judul (ID) wajib diisi.'); return; }
    if (!editing.title.en.trim()) { setError('Judul (EN) wajib diisi.'); return; }
    if (!editing.description.id.trim()) { setError('Deskripsi (ID) wajib diisi.'); return; }
    if (!editing.description.en.trim()) { setError('Deskripsi (EN) wajib diisi.'); return; }
    if (!editing.imageUrl.trim()) { setError('Gambar wajib diisi.'); return; }

    const payload = {
      ...editing,
      projectUrl: editing.projectUrl.trim() || undefined,
    };

    setLoading(true);
    try {
      if (editId) await api.put(`/portfolio/${editId}`, payload);
      else await api.post('/portfolio', payload);
      setEditing(null); setEditId(null); fetchItems();
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const messages = Object.entries(errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
          .join(' | ');
        setError(`Validasi gagal: ${messages}`);
      } else {
        setError(err.response?.data?.message || 'Gagal menyimpan. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus portfolio ini?')) return;
    await api.delete(`/portfolio/${id}`); fetchItems();
  };

  const addTech = () => {
    if (!techInput.trim() || !editing) return;
    setEditing(p => p ? { ...p, techStack: [...p.techStack, techInput.trim()] } : p);
    setTechInput('');
  };

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  if (editing) return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{editId ? 'Edit Portfolio' : 'Portfolio Baru'}</h1>
        <button onClick={() => { setEditing(null); setError(null); }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
      </div>

      {/* Language toggle */}
      <div className="flex gap-2">
        {(['id', 'en'] as const).map(l => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${lang === l ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{l.toUpperCase()}</button>
        ))}
        <span className="text-xs text-gray-500 self-center ml-2">Isi kedua bahasa (ID & EN)</span>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* Title & Description */}
        {(['title', 'description'] as const).map(f => (
          <div key={f}>
            <label className="block text-sm text-gray-400 mb-1">
              {f === 'title' ? 'Judul' : 'Deskripsi'} ({lang.toUpperCase()})
              <span className="text-red-400 ml-1">*</span>
            </label>
            {f === 'description' ? (
              <textarea value={(editing[f] as Record<string, string>)[lang]}
                onChange={e => setEditing(p => p ? { ...p, [f]: { ...p[f], [lang]: e.target.value } as { id: string; en: string } } : p)}
                rows={3} className={`${inputCls} resize-none`} />
            ) : (
              <input value={(editing[f] as Record<string, string>)[lang]}
                onChange={e => setEditing(p => p ? { ...p, [f]: { ...p[f], [lang]: e.target.value } as { id: string; en: string } } : p)}
                className={inputCls} />
            )}
          </div>
        ))}

        {/* Category & Order */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Kategori</label>
            <select value={editing.category} onChange={e => setEditing(p => p ? { ...p, category: e.target.value } : p)}
              className={inputCls}>
              {['company', 'ecommerce', 'webapp', 'landing'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Urutan</label>
            <input type="number" value={editing.order} onChange={e => setEditing(p => p ? { ...p, order: Number(e.target.value) } : p)} className={inputCls} />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Gambar Portfolio <span className="text-red-400">*</span>
          </label>

          {/* Preview */}
          <div className="relative w-full aspect-video bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
            {editing.imageUrl ? (
              <>
                <img src={editing.imageUrl} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setEditing(p => p ? { ...p, imageUrl: '' } : p)}
                  className="absolute top-2 right-2 p-1 bg-red-900/80 text-red-300 rounded hover:bg-red-800 transition-colors"
                  title="Hapus gambar"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-600">
                <ImageIcon className="w-10 h-10" />
                <span className="text-sm">Belum ada gambar</span>
              </div>
            )}
          </div>

          {/* Upload button */}
          <div className="flex gap-3 items-center">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={handleImageUpload}
              className="hidden"
              id="portfolio-image-upload"
            />
            <label
              htmlFor="portfolio-image-upload"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                uploading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-500 text-white'
              }`}
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? 'Mengupload...' : 'Upload Gambar'}
            </label>

            {/* OR: manual URL input */}
            <span className="text-gray-600 text-sm">atau</span>
            <input
              value={editing.imageUrl}
              onChange={e => setEditing(p => p ? { ...p, imageUrl: e.target.value } : p)}
              placeholder="paste URL..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1.5">Format: JPG, PNG, WEBP, GIF, SVG. Maks 5MB.</p>
        </div>

        {/* Project URL */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Project URL (opsional)</label>
          <input value={editing.projectUrl} onChange={e => setEditing(p => p ? { ...p, projectUrl: e.target.value } : p)}
            placeholder="https://..." className={inputCls} />
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tech Stack</label>
          <div className="flex gap-2 mb-2">
            <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTech()}
              placeholder="React, Node.js, ..." className={`${inputCls} flex-1`} />
            <button onClick={addTech} className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Tambah</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {editing.techStack.map(t => (
              <span key={t} className="flex items-center gap-1 px-2 py-1 bg-primary-900/50 text-primary-300 text-xs rounded-full">
                {t}
                <button onClick={() => setEditing(p => p ? { ...p, techStack: p.techStack.filter(x => x !== t) } : p)} className="hover:text-red-400">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Featured */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={editing.featured} onChange={e => setEditing(p => p ? { ...p, featured: e.target.checked } : p)} className="w-4 h-4 accent-primary-500" />
          <span className="text-sm text-gray-300">Featured</span>
        </label>
      </div>

      <button onClick={handleSave} disabled={loading || uploading} className="flex items-center gap-2 btn-primary px-6 py-3 disabled:opacity-50">
        <Save className="w-4 h-4" /> {loading ? 'Menyimpan...' : 'Simpan'}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <button onClick={() => { setEditing({ ...empty }); setEditId(null); setError(null); }} className="flex items-center gap-2 btn-primary px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="aspect-video bg-gray-800 relative">
              {item.imageUrl && <img src={item.imageUrl} alt={(item.title as Record<string, string>).id} className="w-full h-full object-cover" loading="lazy" />}
              {item.featured && <span className="absolute top-2 left-2"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /></span>}
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-white">{(item.title as Record<string, string>).id}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

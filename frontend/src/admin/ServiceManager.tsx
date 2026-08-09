import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import type { Service } from '../types';

const ICONS = ['globe', 'code', 'palette', 'search', 'wrench', 'smartphone', 'layout', 'shield', 'zap', 'database'];
const empty = { title: { id: '', en: '' }, description: { id: '', en: '' }, icon: 'code', imageUrl: '', order: 0, active: true };

export default function ServiceManager() {
  const [items, setItems] = useState<Service[]>([]);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchItems = () => api.get('/services').then(r => setItems(r.data.data || [])).catch(() => {});
  useEffect(() => { fetchItems(); }, []);

  const startEdit = (item: Service) => {
    setError(null);
    setEditing({
      title: item.title as { id: string; en: string },
      description: item.description as { id: string; en: string },
      icon: item.icon,
      imageUrl: item.imageUrl || '',
      order: item.order,
      active: item.active,
    });
    setEditId(item.id);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/media', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.data?.url || res.data.url || '';
      setEditing(p => p ? { ...p, imageUrl: url } : p);
    } catch {
      setError('Upload gagal. Coba lagi atau masukkan URL manual.');
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    if (!editing.title.id.trim()) { setError('Judul (ID) wajib diisi.'); return; }
    if (!editing.title.en.trim()) { setError('Judul (EN) wajib diisi. Buka tab EN dan isi.'); return; }
    if (!editing.description.id.trim()) { setError('Deskripsi (ID) wajib diisi.'); return; }
    if (!editing.description.en.trim()) { setError('Deskripsi (EN) wajib diisi. Buka tab EN dan isi.'); return; }
    setLoading(true);
    try {
      const payload = { ...editing, imageUrl: editing.imageUrl || null };
      if (editId) await api.put(`/services/${editId}`, payload);
      else await api.post('/services', payload);
      setEditing(null); setEditId(null); fetchItems();
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const messages = Object.entries(errors).map(([f, m]) => `${f}: ${(m as string[]).join(', ')}`).join(' | ');
        setError(`Validasi gagal: ${messages}`);
      } else {
        setError(err.response?.data?.message || 'Gagal menyimpan. Coba lagi.');
      }
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus service ini?')) return;
    await api.delete(`/services/${id}`); fetchItems();
  };

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  if (editing) return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{editId ? 'Edit Service' : 'Service Baru'}</h1>
        <button onClick={() => { setEditing(null); setError(null); }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
      </div>

      <div className="flex gap-2">
        {(['id', 'en'] as const).map(l => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${lang === l ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{l.toUpperCase()}</button>
        ))}
        <span className="text-xs text-gray-500 self-center ml-2">Isi kedua bahasa (ID & EN)</span>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {(['title', 'description'] as const).map(f => (
          <div key={f}>
            <label className="block text-sm text-gray-400 mb-1">
              {f === 'title' ? 'Judul' : 'Deskripsi'} ({lang.toUpperCase()}) <span className="text-red-400">*</span>
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

        {/* Image Section */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Gambar Service (opsional)</label>
          <div className="space-y-3">
            {editing.imageUrl && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-700">
                <img src={editing.imageUrl} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setEditing(p => p ? { ...p, imageUrl: '' } : p)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={editing.imageUrl}
                onChange={e => setEditing(p => p ? { ...p, imageUrl: e.target.value } : p)}
                placeholder="https://... (URL gambar)"
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg disabled:opacity-50 whitespace-nowrap">
                {uploading ? <span className="animate-spin">⏳</span> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
            <p className="text-xs text-gray-500">Upload file atau paste URL gambar. Gambar akan ditampilkan di sisi kanan card pada halaman services.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Icon</label>
            <select value={editing.icon} onChange={e => setEditing(p => p ? { ...p, icon: e.target.value } : p)} className={inputCls}>
              {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Urutan</label>
            <input type="number" value={editing.order} onChange={e => setEditing(p => p ? { ...p, order: Number(e.target.value) } : p)} className={inputCls} />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={editing.active} onChange={e => setEditing(p => p ? { ...p, active: e.target.checked } : p)} className="w-4 h-4 accent-primary-500" />
          <span className="text-sm text-gray-300">Aktif</span>
        </label>
      </div>

      <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 btn-primary px-6 py-3 disabled:opacity-50">
        <Save className="w-4 h-4" /> {loading ? 'Menyimpan...' : 'Simpan'}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Services</h1>
        <button onClick={() => { setEditing({ ...empty }); setEditId(null); setError(null); }}
          className="flex items-center gap-2 btn-primary px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm p-8 text-center">Belum ada service.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 px-6 py-3 uppercase">Layanan</th>
                <th className="text-left text-xs text-gray-500 px-6 py-3 uppercase hidden md:table-cell">Gambar</th>
                <th className="text-left text-xs text-gray-500 px-6 py-3 uppercase hidden md:table-cell">Status</th>
                <th className="text-right text-xs text-gray-500 px-6 py-3 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-sm text-white">{(item.title as Record<string, string>).id}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt="" className="w-12 h-8 object-cover rounded" />
                      : <span className="text-xs text-gray-600 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> -</span>}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${item.active ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                      {item.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

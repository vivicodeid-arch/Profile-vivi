import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import type { TeamMember } from '../types';

const empty = { name: '', role: { id: '', en: '' }, bio: { id: '', en: '' }, photo: '', linkedIn: '', order: 0, active: true };

export default function TeamManager() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = () => api.get('/team').then(r => setItems(r.data.data || [])).catch(() => {});
  useEffect(() => { fetchItems(); }, []);

  const startEdit = (item: TeamMember) => {
    setError(null);
    setEditing({
      name: item.name,
      role: item.role as { id: string; en: string },
      bio: item.bio as { id: string; en: string },
      photo: item.photo || '',
      linkedIn: item.linkedIn || '',
      order: item.order,
      active: true,
    });
    setEditId(item.id);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('alt', editing.name || 'team member');

      const response = await api.post('/media', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status === 'ok') {
        setEditing(p => p ? { ...p, photo: response.data.data.url } : p);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengupload foto.');
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);

    if (!editing.name.trim()) { setError('Nama wajib diisi.'); return; }
    if (!editing.role.id.trim()) { setError('Jabatan (ID) wajib diisi.'); return; }
    if (!editing.role.en.trim()) { setError('Jabatan (EN) wajib diisi. Buka tab EN dan isi.'); return; }
    if (!editing.bio.id.trim()) { setError('Bio (ID) wajib diisi.'); return; }
    if (!editing.bio.en.trim()) { setError('Bio (EN) wajib diisi. Buka tab EN dan isi.'); return; }

    const payload = {
      ...editing,
      photo: editing.photo.trim() || undefined,
      linkedIn: editing.linkedIn.trim() || undefined,
    };

    setLoading(true);
    try {
      if (editId) await api.put(`/team/${editId}`, payload);
      else await api.post('/team', payload);
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
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus member ini?')) return;
    await api.delete(`/team/${id}`); fetchItems();
  };

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  if (editing) return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{editId ? 'Edit Member' : 'Member Baru'}</h1>
        <button onClick={() => { setEditing(null); setError(null); }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
      </div>

      {/* Language tabs */}
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
        {/* Nama */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nama <span className="text-red-400">*</span></label>
          <input value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)} className={inputCls} />
        </div>

        {/* Role & Bio */}
        {(['role', 'bio'] as const).map(f => (
          <div key={f}>
            <label className="block text-sm text-gray-400 mb-1">
              {f === 'role' ? 'Jabatan' : 'Bio'} ({lang.toUpperCase()}) <span className="text-red-400">*</span>
            </label>
            {f === 'bio' ? (
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

        {/* Foto */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Foto</label>

          {/* Preview */}
          <div className="flex items-center gap-4 mb-3">
            {editing.photo ? (
              <div className="relative">
                <img src={editing.photo} alt="preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-700" />
                <button
                  onClick={() => setEditing(p => p ? { ...p, photo: '' } : p)}
                  className="absolute -top-1 -right-1 p-0.5 bg-red-900/80 text-red-300 rounded-full hover:bg-red-800 transition-colors"
                  title="Hapus foto"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-600">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}

            <div className="flex flex-col gap-2 flex-1">
              <div className="flex gap-2 items-center">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="team-photo-upload"
                />
                <label
                  htmlFor="team-photo-upload"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                    uploading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-500 text-white'
                  }`}
                >
                  {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Mengupload...' : 'Upload Foto'}
                </label>
              </div>
              <input
                value={editing.photo}
                onChange={e => setEditing(p => p ? { ...p, photo: e.target.value } : p)}
                placeholder="atau paste URL foto..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <p className="text-xs text-gray-600">Format: JPG, PNG, WEBP. Maks 5MB.</p>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">LinkedIn URL (opsional)</label>
          <input value={editing.linkedIn}
            onChange={e => setEditing(p => p ? { ...p, linkedIn: e.target.value } : p)}
            placeholder="https://linkedin.com/in/..." className={inputCls} />
        </div>

        {/* Urutan */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Urutan</label>
          <input type="number" value={editing.order}
            onChange={e => setEditing(p => p ? { ...p, order: Number(e.target.value) } : p)}
            className={inputCls} />
        </div>
      </div>

      <button onClick={handleSave} disabled={loading || uploading}
        className="flex items-center gap-2 btn-primary px-6 py-3 disabled:opacity-50">
        <Save className="w-4 h-4" /> {loading ? 'Menyimpan...' : 'Simpan'}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <button onClick={() => { setEditing({ ...empty }); setEditId(null); setError(null); }}
          className="flex items-center gap-2 btn-primary px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              {item.photo ? (
                <img src={item.photo} alt={item.name} className="w-12 h-12 rounded-full object-cover" loading="lazy" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 font-bold text-lg">
                  {item.name[0]}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-gray-500">{(item.role as Record<string, string>).id}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

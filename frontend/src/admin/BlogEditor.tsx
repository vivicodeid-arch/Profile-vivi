import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import type { Post } from '../types';

const emptyPost = {
  slug: '', title: { id: '', en: '' }, content: { id: '', en: '' },
  excerpt: { id: '', en: '' }, metaTitle: { id: '', en: '' },
  metaDesc: { id: '', en: '' }, coverImage: '', published: false,
};

export default function BlogEditor() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<typeof emptyPost | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeLang, setActiveLang] = useState<'id' | 'en'>('id');
  const [error, setError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = () => {
    api.get('/blog?limit=50&all=true').then(r => setPosts(r.data.data || [])).catch(() => {});
  };

  useEffect(() => { fetchPosts(); }, []);

  const startNew = () => { setEditing({ ...emptyPost }); setEditId(null); setError(null); };

  // Fetch full post data by slug before editing (list API only returns partial fields)
  const startEdit = async (post: Post) => {
    setError(null);
    try {
      const res = await api.get(`/blog/${post.slug}`);
      const full = res.data.data as Post;
      setEditing({
        slug: full.slug,
        title: full.title as { id: string; en: string },
        content: full.content as { id: string; en: string },
        excerpt: full.excerpt as { id: string; en: string },
        metaTitle: full.metaTitle as { id: string; en: string },
        metaDesc: full.metaDesc as { id: string; en: string },
        coverImage: full.coverImage || '',
        published: full.published,
      });
      setEditId(full.id);
    } catch {
      setError('Gagal memuat data post. Coba lagi.');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('alt', editing.title.id || 'cover image');

      const response = await api.post('/media', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status === 'ok') {
        setEditing(p => p ? { ...p, coverImage: response.data.data.url } : p);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengupload gambar.');
    } finally {
      setUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);

    if (!editing.slug.trim()) { setError('Slug wajib diisi (contoh: judul-artikel-saya).'); return; }
    if (!/^[a-z0-9-]+$/.test(editing.slug)) { setError('Slug hanya boleh huruf kecil, angka, dan tanda hubung (-).'); return; }
    if (!editing.title.id.trim()) { setError('Judul (ID) wajib diisi.'); return; }
    if (!editing.title.en.trim()) { setError('Judul (EN) wajib diisi. Buka tab EN dan isi.'); return; }
    if (!editing.content.id.trim()) { setError('Konten (ID) wajib diisi.'); return; }
    if (!editing.content.en.trim()) { setError('Konten (EN) wajib diisi. Buka tab EN dan isi.'); return; }
    if (!editing.excerpt.id.trim()) { setError('Excerpt (ID) wajib diisi.'); return; }
    if (!editing.excerpt.en.trim()) { setError('Excerpt (EN) wajib diisi. Buka tab EN dan isi.'); return; }

    const payload = {
      ...editing,
      coverImage: editing.coverImage.trim() || undefined,
    };

    setLoading(true);
    try {
      if (editId) {
        await api.put(`/blog/${editId}`, payload);
      } else {
        await api.post('/blog', payload);
      }
      setEditing(null); setEditId(null);
      fetchPosts();
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
    if (!confirm('Hapus post ini?')) return;
    await api.delete(`/blog/${id}`);
    fetchPosts();
  };

  const setField = (field: string, lang: 'id' | 'en', value: string) => {
    setEditing(prev => prev ? { ...prev, [field]: { ...(prev[field as keyof typeof prev] as object), [lang]: value } } : prev);
  };

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  if (editing) return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{editId ? 'Edit Post' : 'Post Baru'}</h1>
        <button onClick={() => { setEditing(null); setError(null); }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
      </div>

      {/* Language tabs */}
      <div className="flex gap-2">
        {(['id', 'en'] as const).map(l => (
          <button key={l} onClick={() => setActiveLang(l)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeLang === l ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{l.toUpperCase()}</button>
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
        {/* Slug */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Slug <span className="text-red-400">*</span></label>
          <input value={editing.slug}
            onChange={e => setEditing(p => p ? { ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : p)}
            placeholder="judul-artikel-saya" className={inputCls} />
          <p className="text-xs text-gray-600 mt-1">Hanya huruf kecil, angka, dan tanda hubung.</p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Judul ({activeLang.toUpperCase()}) <span className="text-red-400">*</span></label>
          <input value={(editing.title as Record<string, string>)[activeLang]}
            onChange={e => setField('title', activeLang, e.target.value)} className={inputCls} />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Excerpt ({activeLang.toUpperCase()}) <span className="text-red-400">*</span></label>
          <textarea value={(editing.excerpt as Record<string, string>)[activeLang]}
            onChange={e => setField('excerpt', activeLang, e.target.value)}
            rows={2} className={`${inputCls} resize-none`} />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Konten ({activeLang.toUpperCase()}) <span className="text-red-400">*</span></label>
          <textarea value={(editing.content as Record<string, string>)[activeLang]}
            onChange={e => setField('content', activeLang, e.target.value)}
            rows={10} className={`${inputCls} resize-y`} />
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Meta Title ({activeLang.toUpperCase()})</label>
            <input value={(editing.metaTitle as Record<string, string>)[activeLang]}
              onChange={e => setField('metaTitle', activeLang, e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Meta Desc ({activeLang.toUpperCase()})</label>
            <input value={(editing.metaDesc as Record<string, string>)[activeLang]}
              onChange={e => setField('metaDesc', activeLang, e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Cover Image</label>

          <div className="relative w-full aspect-video bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
            {editing.coverImage ? (
              <>
                <img src={editing.coverImage} alt="cover preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setEditing(p => p ? { ...p, coverImage: '' } : p)}
                  className="absolute top-2 right-2 p-1 bg-red-900/80 text-red-300 rounded hover:bg-red-800 transition-colors"
                  title="Hapus gambar"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-600">
                <ImageIcon className="w-10 h-10" />
                <span className="text-sm">Belum ada cover image</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={handleCoverUpload}
              className="hidden"
              id="blog-cover-upload"
            />
            <label
              htmlFor="blog-cover-upload"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                uploading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-500 text-white'
              }`}
            >
              {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Mengupload...' : 'Upload Gambar'}
            </label>
            <span className="text-gray-600 text-sm">atau</span>
            <input
              value={editing.coverImage}
              onChange={e => setEditing(p => p ? { ...p, coverImage: e.target.value } : p)}
              placeholder="paste URL..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1.5">Format: JPG, PNG, WEBP. Maks 5MB.</p>
        </div>

        {/* Published */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={editing.published}
            onChange={e => setEditing(p => p ? { ...p, published: e.target.checked } : p)}
            className="w-4 h-4 accent-primary-500" />
          <span className="text-sm text-gray-300">Publish (tampil di website)</span>
        </label>
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
        <h1 className="text-2xl font-bold text-white">Blog</h1>
        <button onClick={startNew} className="flex items-center gap-2 btn-primary px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Post Baru
        </button>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Belum ada post.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{(post.title as Record<string, string>).id}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${post.published ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                      {post.published ? <><Eye className="w-3 h-3" /> Publish</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(post)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
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

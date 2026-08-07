import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../services/api';
import type { Post } from '../types';
import PostFormPanel, {
  type PostForm,
  type Lang,
  EMPTY_FORM,
  validatePost,
} from './blog/PostFormPanel';
import PostList from './blog/PostList';
import ErrorAlert from '../components/ui/ErrorAlert';
import Spinner from '../components/ui/Spinner';

/**
 * Blog editor — orchestrates PostList and PostFormPanel.
 * Owns all data-fetching and mutation logic; child components are pure UI.
 */
export default function BlogEditor() {
  const [posts, setPosts]     = useState<Post[]>([]);
  const [form, setForm]       = useState<PostForm | null>(null);
  const [editId, setEditId]   = useState<string | null>(null);
  const [lang, setLang]       = useState<Lang>('id');
  const [isSaving, setSaving] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------

  const fetchPosts = () => {
    api.get('/blog?limit=50&all=true')
      .then(r => setPosts(r.data.data ?? []))
      .catch(() => {});
  };

  useEffect(() => { fetchPosts(); }, []);

  // ---------------------------------------------------------------------------
  // Form lifecycle
  // ---------------------------------------------------------------------------

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setError(null);
  };

  const openEdit = async (post: Post) => {
    setError(null);
    setLoading(true);
    try {
      const res  = await api.get(`/blog/${post.slug}`);
      const full = res.data.data as Post;
      setForm({
        slug:       full.slug,
        title:      full.title      as Record<Lang, string>,
        content:    full.content    as Record<Lang, string>,
        excerpt:    full.excerpt    as Record<Lang, string>,
        metaTitle:  full.metaTitle  as Record<Lang, string>,
        metaDesc:   full.metaDesc   as Record<Lang, string>,
        coverImage: full.coverImage ?? '',
        published:  full.published,
      });
      setEditId(full.id);
    } catch {
      setError('Gagal memuat data post.');
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => { setForm(null); setEditId(null); setError(null); };

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    if (!form) return;
    const err = validatePost(form);
    if (err) { setError(err); return; }

    setSaving(true);
    setError(null);
    try {
      if (editId) {
        await api.put(`/blog/${editId}`, form);
      } else {
        await api.post('/blog', form);
      }
      fetchPosts();
      closeForm();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus post ini?')) return;
    try {
      await api.delete(`/blog/${id}`);
      fetchPosts();
    } catch {
      setError('Gagal menghapus post.');
    }
  };

  // ---------------------------------------------------------------------------
  // Bilingual field helper
  // ---------------------------------------------------------------------------

  const handleBilingualChange = (
    field: keyof Pick<PostForm, 'title' | 'content' | 'excerpt' | 'metaTitle' | 'metaDesc'>,
    value: string,
  ) => setForm(prev => prev ? { ...prev, [field]: { ...prev[field], [lang]: value } } : prev);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (form) {
    return (
      <PostFormPanel
        form={form}
        editId={editId}
        lang={lang}
        isSaving={isSaving}
        error={error}
        onLangChange={setLang}
        onFieldChange={patch => setForm(prev => prev ? { ...prev, ...patch } : prev)}
        onBilingualChange={handleBilingualChange}
        onSave={handleSave}
        onClose={closeForm}
        onError={setError}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Blog</h1>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Post Baru
        </button>
      </div>

      {error    && <ErrorAlert message={error} />}
      {isLoading && <Spinner />}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <PostList posts={posts} onEdit={openEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}

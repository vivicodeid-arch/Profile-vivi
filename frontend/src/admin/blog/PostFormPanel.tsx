import { Save, X } from 'lucide-react';
import LangTabs from '../../components/admin/LangTabs';
import ImageUploadField from '../../components/admin/ImageUploadField';
import RichEditor from '../../components/admin/RichEditor';
import ErrorAlert from '../../components/ui/ErrorAlert';

export type Lang = 'id' | 'en';

export interface PostForm {
  slug: string;
  title:     Record<Lang, string>;
  content:   Record<Lang, string>;
  excerpt:   Record<Lang, string>;
  metaTitle: Record<Lang, string>;
  metaDesc:  Record<Lang, string>;
  coverImage: string;
  published: boolean;
}

export const EMPTY_FORM: PostForm = {
  slug: '',
  title:     { id: '', en: '' },
  content:   { id: '', en: '' },
  excerpt:   { id: '', en: '' },
  metaTitle: { id: '', en: '' },
  metaDesc:  { id: '', en: '' },
  coverImage: '',
  published: false,
};

export function validatePost(form: PostForm): string | null {
  if (!form.slug.trim())        return 'Slug wajib diisi.';
  if (!form.title.id.trim())    return 'Judul (ID) wajib diisi.';
  if (!form.content.id.trim())  return 'Konten (ID) wajib diisi.';
  if (!/^[a-z0-9-]+$/.test(form.slug))
    return 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.';
  return null;
}

// ---------------------------------------------------------------------------

interface PostFormPanelProps {
  form: PostForm;
  editId: string | null;
  lang: Lang;
  isSaving: boolean;
  error: string | null;
  onLangChange: (l: Lang) => void;
  onFieldChange: (patch: Partial<PostForm>) => void;
  onBilingualChange: (
    field: keyof Pick<PostForm, 'title' | 'content' | 'excerpt' | 'metaTitle' | 'metaDesc'>,
    value: string,
  ) => void;
  onSave: () => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

const inputCls =
  'w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500';

/**
 * Edit / create form panel for a single blog post.
 * Pure presentational — all state is managed by BlogEditor.
 */
export default function PostFormPanel({
  form, editId, lang, isSaving, error,
  onLangChange, onFieldChange, onBilingualChange,
  onSave, onClose, onError,
}: PostFormPanelProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">
          {editId ? 'Edit Post' : 'Post Baru'}
        </h1>
        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Tutup">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && <ErrorAlert message={error} />}

      <LangTabs active={lang} onChange={onLangChange} />

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug *</label>
        <input
          type="text"
          value={form.slug}
          onChange={e => onFieldChange({ slug: e.target.value })}
          placeholder="contoh: tips-website-2024"
          className={inputCls}
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Judul ({lang.toUpperCase()}) *
        </label>
        <input
          type="text"
          value={form.title[lang]}
          onChange={e => onBilingualChange('title', e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Ringkasan ({lang.toUpperCase()})
        </label>
        <textarea
          rows={3}
          value={form.excerpt[lang]}
          onChange={e => onBilingualChange('excerpt', e.target.value)}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Konten ({lang.toUpperCase()}) *
        </label>
        <RichEditor
          value={form.content[lang]}
          onChange={val => onBilingualChange('content', val)}
          placeholder="Tulis konten artikel…"
        />
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Meta Title ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={form.metaTitle[lang]}
            onChange={e => onBilingualChange('metaTitle', e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Meta Description ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={form.metaDesc[lang]}
            onChange={e => onBilingualChange('metaDesc', e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Cover image */}
      <ImageUploadField
        label="Gambar Cover"
        value={form.coverImage}
        onChange={url => onFieldChange({ coverImage: url })}
        altText={form.title.id || 'cover'}
        onError={onError}
      />

      {/* Published toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => onFieldChange({ published: !form.published })}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            form.published ? 'bg-primary-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              form.published ? 'translate-x-5' : ''
            }`}
          />
        </div>
        <span className="text-sm text-gray-300">
          {form.published ? 'Published' : 'Draft'}
        </span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Menyimpan…' : 'Simpan'}
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-600 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

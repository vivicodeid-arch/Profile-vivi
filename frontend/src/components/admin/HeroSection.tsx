import { useRef } from 'react';
import { Video, Monitor, Image as ImageIcon, Upload, X } from 'lucide-react';
import { POSITION_OPTIONS, type HeroPosition, type HeroType } from '../../lib/constants';
import api from '../../services/api';

interface HeroConfig {
  type: HeroType;
  url: string;
  title: string;
  subtitle: string;
  position: HeroPosition;
}

interface HeroSectionProps {
  /** Display label for this hero section, e.g. "Halaman About" */
  label: string;
  value: HeroConfig;
  onChange: (updated: HeroConfig) => void;
  onError?: (message: string) => void;
}

const TYPE_OPTIONS: { value: HeroType; icon: React.ElementType; label: string }[] = [
  { value: 'gradient', icon: Monitor,   label: 'Gradient' },
  { value: 'image',    icon: ImageIcon, label: 'Gambar'   },
  { value: 'video',    icon: Video,     label: 'Video'    },
];

/**
 * Reusable hero configuration section for SettingsManager.
 * Handles type selection, media upload/URL input, title/subtitle text, and position picker.
 */
export default function HeroSection({ label, value, onChange, onError }: HeroSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<HeroConfig>) => onChange({ ...value, ...patch });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', `${label} hero`);

    try {
      const res = await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'ok') {
        set({ url: res.data.data.url as string });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengupload media.';
      onError?.(msg);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4 dark:border-gray-700 dark:bg-gray-800/50">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</h3>

      {/* Hero type selector */}
      <div className="flex gap-2">
        {TYPE_OPTIONS.map(({ value: v, icon: Icon, label: l }) => (
          <button
            key={v}
            type="button"
            onClick={() => set({ type: v })}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              value.type === v
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {l}
          </button>
        ))}
      </div>

      {/* Media URL / upload (hidden for gradient) */}
      {value.type !== 'gradient' && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            {value.type === 'video' ? 'URL Video' : 'URL Gambar'}
          </label>

          {/* Image preview */}
          {value.type === 'image' && value.url && (
            <div className="relative inline-block">
              <img
                src={value.url}
                alt="Hero preview"
                className="h-28 w-auto rounded-lg border border-gray-300 dark:border-gray-600 object-cover"
              />
              <button
                type="button"
                onClick={() => set({ url: '' })}
                aria-label="Hapus gambar"
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={value.url}
              onChange={e => set({ url: e.target.value })}
              placeholder="https://…"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept={value.type === 'video' ? 'video/*' : 'image/*'}
              className="hidden"
              onChange={handleUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2
                text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700
                dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              Upload
            </button>
          </div>
        </div>
      )}

      {/* Title & subtitle */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Judul</label>
          <input
            type="text"
            value={value.title}
            onChange={e => set({ title: e.target.value })}
            placeholder="Judul hero (opsional)"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
              dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Subjudul</label>
          <input
            type="text"
            value={value.subtitle}
            onChange={e => set({ subtitle: e.target.value })}
            placeholder="Subjudul hero (opsional)"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
              dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Position picker (only for image/video) */}
      {value.type !== 'gradient' && (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Posisi Fokus</label>
          <div className="grid grid-cols-3 gap-1 w-fit">
            {POSITION_OPTIONS.map(({ value: v, label: l }) => (
              <button
                key={v}
                type="button"
                title={v.replace('-', ' ')}
                onClick={() => set({ position: v })}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold transition-all ${
                  value.position === v
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Posisi: <span className="font-medium">{value.position.replace('-', ' ')}</span>
          </p>
        </div>
      )}
    </div>
  );
}

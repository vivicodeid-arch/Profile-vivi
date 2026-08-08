import { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, FolderOpen, Check } from 'lucide-react';
import api from '../../services/api';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt?: string;
}

interface ImageUploadFieldProps {
  /** Current image URL value */
  value: string;
  /** Called when upload succeeds or user clears the field */
  onChange: (url: string) => void;
  /** Alt text sent to the media endpoint */
  altText?: string;
  /** Display label */
  label?: string;
  /** Called when an upload error occurs */
  onError?: (message: string) => void;
}

/**
 * Reusable image upload field for admin panels.
 * Shows a preview thumbnail, upload button, clear button,
 * and a "Pilih dari Media" button to pick from existing library.
 */
export default function ImageUploadField({
  value,
  onChange,
  altText = 'image',
  label = 'Gambar',
  onError,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', altText);

    try {
      const res = await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'ok') {
        onChange(res.data.data.url as string);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengupload gambar.';
      onError?.(message);
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const openPicker = async () => {
    setShowPicker(true);
    setLoadingMedia(true);
    try {
      const res = await api.get('/media');
      setMediaItems(res.data.data || []);
    } catch {
      onError?.('Gagal memuat media library.');
    } finally {
      setLoadingMedia(false);
    }
  };

  const selectMedia = (url: string) => {
    onChange(url);
    setShowPicker(false);
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPicker(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showPicker]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt={altText}
            className="h-24 w-auto rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
            aria-label="Hapus gambar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex h-24 w-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <ImageIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5
            text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700
            dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          Upload
        </button>

        <button
          type="button"
          onClick={openPicker}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5
            text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700
            dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Pilih dari Media
        </button>

        {value && (
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="atau tempel URL…"
            className="flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs
              text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          />
        )}
      </div>

      {/* Media Picker Modal */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowPicker(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Pilih dari Media Library"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Pilih dari Media Library
              </h3>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto p-4 flex-1">
              {loadingMedia ? (
                <p className="text-sm text-gray-500 text-center py-10">Memuat media…</p>
              ) : mediaItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10">Belum ada media.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectMedia(item.url)}
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all
                        ${value === item.url
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-blue-400'
                        }`}
                    >
                      <img
                        src={item.url}
                        alt={item.alt || item.filename}
                        className="h-24 w-full object-cover bg-gray-100 dark:bg-gray-800"
                      />
                      {value === item.url && (
                        <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

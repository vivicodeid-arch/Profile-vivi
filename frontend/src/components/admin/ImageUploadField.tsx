import { useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import api from '../../services/api';

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
 * Shows a preview thumbnail, upload button, and clear button.
 * Uploads directly to /api/media and returns the hosted URL via onChange.
 */
export default function ImageUploadField({
  value,
  onChange,
  altText = 'image',
  label = 'Gambar',
  onError,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
      // Reset so the same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = '';
    }
  };

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

      <div className="flex items-center gap-2">
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

        {value && (
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="atau tempel URL…"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs
              text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          />
        )}
      </div>
    </div>
  );
}

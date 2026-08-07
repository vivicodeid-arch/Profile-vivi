import { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, Copy, Check, Image } from 'lucide-react';
import api from '../services/api';

interface Media {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  createdAt: string;
}

export default function MediaManager() {
  const [items, setItems] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetch = () => api.get('/media').then(r => setItems(r.data.data || [])).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await api.post('/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetch();
    } catch { alert('Upload gagal. Pastikan file adalah gambar dan ukuran < 5MB.'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus media ini?')) return;
    await api.delete(`/media/${id}`);
    fetch();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Media</h1>
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" id="media-upload" />
          <label htmlFor="media-upload"
            className={`flex items-center gap-2 btn-primary px-4 py-2 text-sm cursor-pointer ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <Upload className="w-4 h-4" />
            {uploading ? 'Mengupload...' : 'Upload Gambar'}
          </label>
        </div>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-primary-600 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file && fileRef.current) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileRef.current.files = dt.files;
            fileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }}
      >
        <Image className="w-10 h-10 text-gray-600 mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm text-gray-400">Klik atau drag & drop gambar di sini</p>
        <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP, GIF, SVG — maks 5MB</p>
      </div>

      {/* Media Grid */}
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-10">Belum ada media.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group">
              <div className="aspect-square bg-gray-800 relative">
                <img src={item.url} alt={item.alt || item.filename}
                  className="w-full h-full object-cover" loading="lazy" />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(item.url)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    aria-label="Copy URL">
                    {copied === item.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-white transition-colors"
                    aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-400 truncate">{item.filename}</p>
                <p className="text-xs text-gray-600">{formatSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

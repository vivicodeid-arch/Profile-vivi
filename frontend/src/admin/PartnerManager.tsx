import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Plus, Trash2, Save, GripVertical, Eye, EyeOff, Upload, X } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  order: number;
  active: boolean;
}

export default function PartnerManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', logoUrl: '', websiteUrl: '' });
  const [uploading, setUploading] = useState(false);
  
  const newFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await api.get('/partners/all');
      setPartners(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, onSuccess: (url: string) => void) => {
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('alt', file.name);
      const res = await api.post('/media', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.status === 'ok') onSuccess(res.data.data.url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!newPartner.name || !newPartner.logoUrl) return alert('Nama dan logo wajib diisi');
    try {
      const res = await api.post('/partners', {
        ...newPartner,
        order: partners.length,
        active: true,
      });
      setPartners(prev => [...prev, res.data.data]);
      setNewPartner({ name: '', logoUrl: '', websiteUrl: '' });
      setShowAdd(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add partner');
    }
  };

  const handleToggle = async (partner: Partner) => {
    setSaving(partner.id);
    try {
      const res = await api.put(`/partners/${partner.id}`, { active: !partner.active });
      setPartners(prev => prev.map(p => p.id === partner.id ? res.data.data : p));
    } catch (err: any) {
      alert('Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus partner ini?')) return;
    try {
      await api.delete(`/partners/${id}`);
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert('Failed to delete');
    }
  };

  const handleOrderChange = async (id: string, newOrder: number) => {
    setSaving(id);
    try {
      const res = await api.put(`/partners/${id}`, { order: newOrder });
      setPartners(prev => prev.map(p => p.id === id ? res.data.data : p).sort((a, b) => a.order - b.order));
    } catch {
    } finally {
      setSaving(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Partner / Klien</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola logo partner yang tampil di homepage</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Tambah Partner
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Partner Baru</h2>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nama Partner *</label>
              <input
                type="text"
                value={newPartner.name}
                onChange={e => setNewPartner(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="Nama perusahaan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Website (opsional)</label>
              <input
                type="url"
                value={newPartner.websiteUrl}
                onChange={e => setNewPartner(p => ({ ...p, websiteUrl: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Logo *</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newPartner.logoUrl}
                  onChange={e => setNewPartner(p => ({ ...p, logoUrl: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder="URL logo atau upload"
                />
                <button
                  onClick={() => newFileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <input
                  ref={newFileInputRef}
                  type="file"
                  accept="image/*,.webp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file, url => setNewPartner(p => ({ ...p, logoUrl: url })));
                  }}
                />
              </div>
              {newPartner.logoUrl && (
                <div className="mt-2 h-12 w-32 bg-gray-800 rounded flex items-center justify-center p-2">
                  <img src={newPartner.logoUrl} alt="preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-3">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">Batal</button>
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 text-sm font-medium transition-colors">
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </div>
      )}

      {/* Partners List */}
      <div className="space-y-3">
        {partners.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Belum ada partner. Tambahkan yang pertama!</div>
        ) : (
          partners.sort((a, b) => a.order - b.order).map((partner) => (
            <div key={partner.id} className={`flex items-center gap-4 p-4 bg-gray-900 border rounded-xl transition-colors ${partner.active ? 'border-gray-700' : 'border-gray-800 opacity-60'}`}>
              <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />

              {/* Logo */}
              <div className="w-24 h-10 bg-gray-800 rounded flex items-center justify-center p-2 shrink-0">
                <img src={partner.logoUrl} alt={partner.name} className="max-h-full max-w-full object-contain" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{partner.name}</p>
                {partner.websiteUrl && <p className="text-gray-500 text-xs truncate">{partner.websiteUrl}</p>}
              </div>

              {/* Order */}
              <input
                type="number"
                value={partner.order}
                onChange={e => handleOrderChange(partner.id, parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm text-center focus:outline-none focus:border-primary-500"
                title="Urutan tampil"
              />

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(partner)}
                  disabled={saving === partner.id}
                  className={`p-1.5 rounded-lg transition-colors ${partner.active ? 'text-green-400 hover:bg-green-900/20' : 'text-gray-600 hover:bg-gray-800'}`}
                  title={partner.active ? 'Aktif - klik untuk nonaktifkan' : 'Nonaktif - klik untuk aktifkan'}
                >
                  {partner.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(partner.id)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

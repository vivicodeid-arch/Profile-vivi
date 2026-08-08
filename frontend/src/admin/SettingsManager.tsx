import { useState, useEffect, useRef } from 'react';
import { Save, Upload, X } from 'lucide-react';
import { useSettingsStore, type SettingsUpdate } from '../store/settingsStore';
import HeroSection from '../components/admin/HeroSection';
import ImageUploadField from '../components/admin/ImageUploadField';
import ErrorAlert from '../components/ui/ErrorAlert';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';
import type { HeroPosition, HeroType } from '../lib/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeroConfig {
  type: HeroType;
  url: string;
  title: string;
  subtitle: string;
  position: HeroPosition;
}

interface FormState {
  // General
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  heroImageUrl: string;
  // Per-page heroes
  about:     HeroConfig;
  blog:      HeroConfig;
  contact:   HeroConfig;
  portfolio: HeroConfig;
  services:  HeroConfig;
  pricing:   HeroConfig;
  // Home about section
  aboutHomeImage: string;
  // Home services section
  servicesSectionHomeTitle: string;
  servicesSectionHomeSubtitle: string;
  servicesSectionHomeDescription: string;
  servicesSectionHomeImage: string;
  // CTA slideshow
  ctaSlideImages: string[];
  ctaSlideInterval: number;
  // Contact info
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactWaNumber: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function heroFromSettings(prefix: string, settings: Record<string, string>): HeroConfig {
  return {
    type:     (settings[`${prefix}HeroType`]     || 'gradient') as HeroType,
    url:      settings[`${prefix}HeroUrl`]      || '',
    title:    settings[`${prefix}HeroTitle`]    || '',
    subtitle: settings[`${prefix}HeroSubtitle`] || '',
    position: (settings[`${prefix}HeroPosition`] || 'center') as HeroPosition,
  };
}

function heroToSettings(prefix: string, config: HeroConfig): SettingsUpdate {
  return {
    [`${prefix}HeroType`]:     config.type,
    [`${prefix}HeroUrl`]:      config.url,
    [`${prefix}HeroTitle`]:    config.title,
    [`${prefix}HeroSubtitle`]: config.subtitle,
    [`${prefix}HeroPosition`]: config.position,
  } as SettingsUpdate;
}

const HERO_PAGES: { key: keyof Pick<FormState, 'about' | 'blog' | 'contact' | 'portfolio' | 'services' | 'pricing'>; label: string }[] = [
  { key: 'about',     label: 'Halaman About'     },
  { key: 'blog',      label: 'Halaman Blog'      },
  { key: 'contact',   label: 'Halaman Contact'   },
  { key: 'portfolio', label: 'Halaman Portfolio' },
  { key: 'services',  label: 'Halaman Services'  },
  { key: 'pricing',   label: 'Halaman Pricing'   },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsManager() {
  const { settings, fetchSettings, updateSettings, isLoading } = useSettingsStore();
  const [form, setForm]       = useState<FormState | null>(null);
  const [isSaving, setSaving] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const ctaInputRef           = useRef<HTMLInputElement>(null);

  // Populate form from store whenever settings load
  useEffect(() => {
    if (Object.keys(settings).length === 0) {
      fetchSettings();
      return;
    }
    const s = settings as unknown as Record<string, string>;
    setForm({
      siteName:    s.siteName    || '',
      logoUrl:     s.logoUrl     || '',
      faviconUrl:  s.faviconUrl  || '',
      heroImageUrl: s.heroImageUrl || '',
      aboutHomeImage: s.aboutHomeImage || '',

      about:     heroFromSettings('about',     s),
      blog:      heroFromSettings('blog',      s),
      contact:   heroFromSettings('contact',   s),
      portfolio: heroFromSettings('portfolio', s),
      services:  heroFromSettings('services',  s),
      pricing:   heroFromSettings('pricing',   s),

      servicesSectionHomeTitle:       s.servicesSectionHomeTitle       || '',
      servicesSectionHomeSubtitle:    s.servicesSectionHomeSubtitle    || '',
      servicesSectionHomeDescription: s.servicesSectionHomeDescription || '',
      servicesSectionHomeImage:       s.servicesSectionHomeImage       || '',

      ctaSlideImages:   JSON.parse(s.ctaSlideImages   || '[]') as string[],
      ctaSlideInterval: parseInt(s.ctaSlideInterval   || '5000') / 1000,

      contactEmail:    s.contactEmail    || '',
      contactPhone:    s.contactPhone    || '',
      contactAddress:  s.contactAddress  || '',
      contactWaNumber: s.contactWaNumber || '',
    });
  }, [settings, fetchSettings]);

  if (!form) return <Spinner />;

  // ---------------------------------------------------------------------------
  // CTA image upload
  // ---------------------------------------------------------------------------

  const handleCtaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 10 - form.ctaSlideImages.length;
    const toUpload  = files.slice(0, remaining);

    for (const file of toUpload) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await api.post('/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        const url = res.data?.data?.url as string | undefined;
        if (url) {
          setForm(prev => prev ? { ...prev, ctaSlideImages: [...prev.ctaSlideImages, url] } : prev);
        }
      } catch { /* non-fatal */ }
    }
    if (ctaInputRef.current) ctaInputRef.current.value = '';
  };

  const removeCtaImage = (idx: number) => {
    setForm(prev => prev ? {
      ...prev,
      ctaSlideImages: prev.ctaSlideImages.filter((_, i) => i !== idx),
    } : prev);
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: SettingsUpdate = {
        siteName:    form.siteName,
        logoUrl:     form.logoUrl,
        faviconUrl:  form.faviconUrl,
        heroImageUrl: form.heroImageUrl,
        aboutHomeImage: form.aboutHomeImage,

        ...heroToSettings('about',     form.about),
        ...heroToSettings('blog',      form.blog),
        ...heroToSettings('contact',   form.contact),
        ...heroToSettings('portfolio', form.portfolio),
        ...heroToSettings('services',  form.services),
        ...heroToSettings('pricing',   form.pricing),

        servicesSectionHomeTitle:       form.servicesSectionHomeTitle,
        servicesSectionHomeSubtitle:    form.servicesSectionHomeSubtitle,
        servicesSectionHomeDescription: form.servicesSectionHomeDescription,
        servicesSectionHomeImage:       form.servicesSectionHomeImage,

        ctaSlideImages:   JSON.stringify(form.ctaSlideImages),
        ctaSlideInterval: String(form.ctaSlideInterval * 1000),

        contactEmail:    form.contactEmail,
        contactPhone:    form.contactPhone,
        contactAddress:  form.contactAddress,
        contactWaNumber: form.contactWaNumber,
      };

      await updateSettings(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Shared input class
  // ---------------------------------------------------------------------------

  const inputCls = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-3xl space-y-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Pengaturan Umum</h1>
        <p className="text-sm text-gray-400 mt-1">Konfigurasi tampilan dan konten situs.</p>
      </div>

      {error   && <ErrorAlert message={error} />}
      {success && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-green-700 bg-green-900 px-5 py-3 text-sm text-green-300 shadow-xl flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
          Pengaturan berhasil disimpan.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── General ───────────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Identitas Situs</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nama Situs</label>
              <input type="text" value={form.siteName}
                onChange={e => setForm(p => p ? { ...p, siteName: e.target.value } : p)}
                placeholder="ViviDev.id" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <ImageUploadField
              label="Logo"
              value={form.logoUrl}
              onChange={url => setForm(p => p ? { ...p, logoUrl: url } : p)}
              altText="Logo"
              onError={setError}
            />
            <ImageUploadField
              label="Favicon"
              value={form.faviconUrl}
              onChange={url => setForm(p => p ? { ...p, faviconUrl: url } : p)}
              altText="Favicon"
              onError={setError}
            />
            <ImageUploadField
              label="Gambar Hero Utama (Mockup)"
              value={form.heroImageUrl}
              onChange={url => setForm(p => p ? { ...p, heroImageUrl: url } : p)}
              altText="Hero mockup image"
              onError={setError}
            />
          </div>
        </section>

        {/* ── Contact Info ──────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Informasi Kontak</h2>
          <p className="text-sm text-gray-400">Ditampilkan di Footer dan halaman Contact.</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input type="email" value={form.contactEmail}
                onChange={e => setForm(p => p ? { ...p, contactEmail: e.target.value } : p)}
                placeholder="support@vividev.id" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nomor WA</label>
              <input type="text" value={form.contactWaNumber}
                onChange={e => setForm(p => p ? { ...p, contactWaNumber: e.target.value } : p)}
                placeholder="6285798112370" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Telepon (tampil)</label>
              <input type="text" value={form.contactPhone}
                onChange={e => setForm(p => p ? { ...p, contactPhone: e.target.value } : p)}
                placeholder="+62 857-9811-2370" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Alamat</label>
              <input type="text" value={form.contactAddress}
                onChange={e => setForm(p => p ? { ...p, contactAddress: e.target.value } : p)}
                placeholder="Indonesia" className={inputCls} />
            </div>
          </div>
        </section>

        {/* ── Page Heroes ───────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-white">Hero Setiap Halaman</h2>
          <p className="text-sm text-gray-400">
            Pilih tipe (gradient / gambar / video), upload media, atur judul, dan posisi fokus.
          </p>

          {HERO_PAGES.map(({ key, label }) => (
            <HeroSection
              key={key}
              label={label}
              value={form[key]}
              onChange={cfg => setForm(p => p ? { ...p, [key]: cfg } : p)}
              onError={setError}
            />
          ))}
        </section>

        {/* ── Home About Section ───────────────────────────────────────────── */}
        <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Home — Seksi Tentang Kami</h2>
          <p className="text-sm text-gray-400">Gambar yang tampil di section "Tentang Kami" pada halaman Home.</p>
          <ImageUploadField
            label="Gambar Tentang Kami"
            value={form.aboutHomeImage}
            onChange={url => setForm(p => p ? { ...p, aboutHomeImage: url } : p)}
            altText="About section image"
            onError={setError}
          />
        </section>

        {/* ── Home Services Section ─────────────────────────────────────────── */}
        <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Home — Seksi Layanan</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Judul</label>
            <input type="text" value={form.servicesSectionHomeTitle}
              onChange={e => setForm(p => p ? { ...p, servicesSectionHomeTitle: e.target.value } : p)}
              placeholder="Layanan Kami" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Subjudul</label>
            <input type="text" value={form.servicesSectionHomeSubtitle}
              onChange={e => setForm(p => p ? { ...p, servicesSectionHomeSubtitle: e.target.value } : p)}
              placeholder="Solusi web development lengkap…" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Deskripsi</label>
            <textarea rows={4} value={form.servicesSectionHomeDescription}
              onChange={e => setForm(p => p ? { ...p, servicesSectionHomeDescription: e.target.value } : p)}
              className={`${inputCls} resize-none`} />
          </div>

          <ImageUploadField
            label="Gambar Samping"
            value={form.servicesSectionHomeImage}
            onChange={url => setForm(p => p ? { ...p, servicesSectionHomeImage: url } : p)}
            altText="Services section"
            onError={setError}
          />
        </section>

        {/* ── CTA Slideshow ─────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">CTA Background Slideshow</h2>
          <p className="text-sm text-gray-400">
            Upload 3–10 gambar untuk slideshow di background CTA section halaman Home.
          </p>

          {/* Image grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {form.ctaSlideImages.map((url, idx) => (
              <div key={idx} className="group relative aspect-video overflow-hidden rounded-lg border border-gray-600 bg-gray-900">
                <img src={url} alt={`Slide ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                <button
                  type="button"
                  onClick={() => removeCtaImage(idx)}
                  aria-label="Hapus gambar"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-xs text-white">
                  {idx + 1}
                </span>
              </div>
            ))}

            {form.ctaSlideImages.length < 10 && (
              <button
                type="button"
                onClick={() => ctaInputRef.current?.click()}
                className="aspect-video rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary-400 hover:text-primary-400 transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">Tambah</span>
              </button>
            )}
          </div>

          <input ref={ctaInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleCtaUpload} />

          <div className="flex flex-wrap items-center gap-3">
            {form.ctaSlideImages.length < 10 && (
              <button type="button" onClick={() => ctaInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700">
                <Upload className="h-3 w-3" /> Upload Gambar
              </button>
            )}
            <span className="text-xs text-gray-500">
              {form.ctaSlideImages.length}/10 gambar
            </span>
            {form.ctaSlideImages.length > 0 && form.ctaSlideImages.length < 3 && (
              <span className="text-xs text-amber-400">Minimal 3 gambar untuk slideshow</span>
            )}
          </div>

          {/* Interval */}
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Interval Slide <span className="font-normal text-gray-500">(detik)</span>
            </label>
            <input
              type="number" min={2} max={30}
              value={form.ctaSlideInterval}
              onChange={e => setForm(p => p ? { ...p, ctaSlideInterval: Number(e.target.value) } : p)}
              className={inputCls}
            />
          </div>
        </section>

        {/* ── Save ──────────────────────────────────────────────────────────── */}
        <div className="flex justify-end pb-8">
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 font-semibold text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
}

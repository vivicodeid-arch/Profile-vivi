import { create } from 'zustand';
import api from '../services/api';
import type { HeroPosition, HeroType } from '../lib/constants';

// ---------------------------------------------------------------------------
// localStorage cache — stale-while-revalidate
//
// Problem: heroImageUrl (dan semua settings lain) hanya tersedia setelah API
// call selesai. Ini berarti hero image tidak bisa mulai didownload sampai:
//   HTML → JS → React render → fetch /api/settings → dapat URL → fetch image
// Dua round-trip berurutan ini menambah 300-600ms ke LCP di koneksi lambat.
//
// Fix: simpan settings di localStorage setelah fetch pertama. Di visit
// berikutnya, settings tersedia SYNCHRONOUSLY saat store diinisialisasi —
// hero image URL langsung ada di render pertama, browser bisa preload gambar
// tanpa menunggu API. API tetap dipanggil di background untuk update stale data.
// ---------------------------------------------------------------------------

const CACHE_KEY    = 'vividev_settings_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 jam — revalidate di background setelahnya

interface CacheEntry {
  data:      Record<string, string>;
  savedAt:   number;
}

function loadCachedSettings(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    // Kembalikan cache meski sudah expired — data lama tetap lebih baik dari
    // default kosong. API call di fetchSettings() akan update di background.
    return entry.data ?? null;
  } catch {
    return null;
  }
}

function saveCachedSettings(data: Record<string, string>): void {
  try {
    const entry: CacheEntry = { data, savedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage bisa penuh (QuotaExceededError) — abaikan saja
  }
}

function isCacheStale(): boolean {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return true;
    const entry: CacheEntry = JSON.parse(raw);
    return Date.now() - entry.savedAt > CACHE_TTL_MS;
  } catch {
    return true;
  }
}

// ---------------------------------------------------------------------------
// Typed settings interface — replaces the loose Record<string, string>
// ---------------------------------------------------------------------------

export interface SiteSettings {
  // General
  siteName:   string;
  logoUrl:    string;
  faviconUrl: string;

  // Home hero
  heroImageUrl: string;

  // Per-page heroes
  aboutHeroType:     HeroType;
  aboutHeroUrl:      string;
  aboutHeroTitle:    string;
  aboutHeroSubtitle: string;
  aboutHeroPosition: HeroPosition;

  blogHeroType:     HeroType;
  blogHeroUrl:      string;
  blogHeroTitle:    string;
  blogHeroSubtitle: string;
  blogHeroPosition: HeroPosition;

  contactHeroType:     HeroType;
  contactHeroUrl:      string;
  contactHeroTitle:    string;
  contactHeroSubtitle: string;
  contactHeroPosition: HeroPosition;

  portfolioHeroType:     HeroType;
  portfolioHeroUrl:      string;
  portfolioHeroTitle:    string;
  portfolioHeroSubtitle: string;
  portfolioHeroPosition: HeroPosition;

  servicesHeroType:     HeroType;
  servicesHeroUrl:      string;
  servicesHeroTitle:    string;
  servicesHeroSubtitle: string;
  servicesHeroPosition: HeroPosition;

  pricingHeroType:     HeroType;
  pricingHeroUrl:      string;
  pricingHeroTitle:    string;
  pricingHeroSubtitle: string;
  pricingHeroPosition: HeroPosition;

  // Services section on Home page
  servicesSectionHomeTitle:       string;
  servicesSectionHomeSubtitle:    string;
  servicesSectionHomeDescription: string;
  servicesSectionHomeImage:       string;

  // CTA slideshow
  ctaSlideImages:   string;  // JSON-serialised string[]
  ctaSlideInterval: string;  // milliseconds as string

  // Contact info shown in Footer / Contact page
  contactEmail:   string;
  contactPhone:   string;
  contactAddress: string;
  contactWaNumber: string;

  // Home page — "About" section
  aboutHomeImage:    string;
  aboutHomeSubtitle: string;
  aboutHomeTitle:    string;
  aboutHomeDesc1:    string;
  aboutHomeDesc2:    string;
  aboutHomeFeature1: string;
  aboutHomeFeature2: string;
  aboutHomeFeature3: string;
  aboutHomeFeature4: string;
  aboutHomeFeature5: string;
  aboutHomeFeature6: string;
  aboutHomeCtaUrl:   string;
  aboutHomeCtaText:  string;
}

/** Partial update payload — all keys optional for PATCH-style updates. */
export type SettingsUpdate = Partial<SiteSettings>;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface SettingsState {
  settings: SiteSettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: SettingsUpdate) => Promise<void>;
}

/** Safe defaults so components never have to null-check individual keys. */
const DEFAULT_SETTINGS: SiteSettings = {
  siteName:   '',
  logoUrl:    '',
  faviconUrl: '',
  heroImageUrl: '',

  aboutHeroType: 'gradient', aboutHeroUrl: '', aboutHeroTitle: '', aboutHeroSubtitle: '', aboutHeroPosition: 'center',
  blogHeroType:  'gradient', blogHeroUrl:  '', blogHeroTitle:  '', blogHeroSubtitle:  '', blogHeroPosition:  'center',
  contactHeroType: 'gradient', contactHeroUrl: '', contactHeroTitle: '', contactHeroSubtitle: '', contactHeroPosition: 'center',
  portfolioHeroType: 'gradient', portfolioHeroUrl: '', portfolioHeroTitle: '', portfolioHeroSubtitle: '', portfolioHeroPosition: 'center',
  servicesHeroType: 'gradient', servicesHeroUrl: '', servicesHeroTitle: '', servicesHeroSubtitle: '', servicesHeroPosition: 'center',
  pricingHeroType: 'gradient', pricingHeroUrl: '', pricingHeroTitle: '', pricingHeroSubtitle: '', pricingHeroPosition: 'center',

  servicesSectionHomeTitle: '', servicesSectionHomeSubtitle: '', servicesSectionHomeDescription: '', servicesSectionHomeImage: '',
  ctaSlideImages: '[]', ctaSlideInterval: '5000',

  contactEmail: '', contactPhone: '', contactAddress: '', contactWaNumber: '',

  aboutHomeImage: '', aboutHomeSubtitle: '', aboutHomeTitle: '',
  aboutHomeDesc1: '', aboutHomeDesc2: '',
  aboutHomeFeature1: '', aboutHomeFeature2: '', aboutHomeFeature3: '',
  aboutHomeFeature4: '', aboutHomeFeature5: '', aboutHomeFeature6: '',
  aboutHomeCtaUrl: '', aboutHomeCtaText: '',
};

// Inisialisasi store dengan cached settings jika tersedia.
// Ini membuat heroImageUrl, logoUrl, dll. tersedia SYNCHRONOUSLY pada render
// pertama — browser bisa langsung mulai download hero image tanpa menunggu
// API call, memotong 1 round-trip dari critical path LCP.
const cached = loadCachedSettings();
const INITIAL_SETTINGS: SiteSettings = cached
  ? { ...DEFAULT_SETTINGS, ...cached }
  : DEFAULT_SETTINGS;

// isFetching flag mencegah race condition jika fetchSettings() dipanggil
// bersamaan (misal: auto-fetch di store init + panggilan manual lainnya).
// Tanpa ini, dua request bisa berjalan paralel dan yang selesai terakhir
// akan overwrite state dengan data yang mungkin lebih lama.
let isFetching = false;

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: INITIAL_SETTINGS,
  // isLoading: false — komponen merender langsung dari cached/default settings.
  // Tidak ada skeleton → layout shift (CLS).
  isLoading: false,

  fetchSettings: async () => {
    // Jika cache masih fresh, skip fetch dan render dari cache saja.
    if (!isCacheStale()) return;
    // Cegah double-fetch jika dipanggil bersamaan
    if (isFetching) return;
    isFetching = true;

    // Tidak set isLoading:true — update terjadi di background tanpa
    // menyebabkan skeleton/spinner yang bisa menggeser layout (CLS).
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    try {
      const res = await api.get('/settings', { signal: controller.signal });
      if (res.data.status === 'ok') {
        const merged = { ...DEFAULT_SETTINGS, ...res.data.data };
        set({ settings: merged });
        // Simpan ke localStorage untuk kunjungan berikutnya
        saveCachedSettings(res.data.data);
      }
    } catch (err: unknown) {
      // Abaikan AbortError (timeout) — tidak perlu log, pakai cache saja
      if (err instanceof Error && err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Failed to fetch settings:', err);
      }
    } finally {
      clearTimeout(timeoutId);
      isFetching = false;
    }
  },

  updateSettings: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.put('/settings', data);
      if (res.data.status === 'ok') {
        const merged = { ...DEFAULT_SETTINGS, ...res.data.data };
        set({ settings: merged });
        // Invalidate cache agar visit berikutnya dapat data terbaru
        saveCachedSettings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Auto-fetch settings saat store pertama kali dibuat — bukan nunggu useEffect
// di komponen. Ini mengurangi waktu antara React render pertama dan settings
// update, mempercepat heroImageUrl tersedia jika cache expired.
// Fetch berjalan di background, tidak blocking render sama sekali.
if (isCacheStale()) {
  useSettingsStore.getState().fetchSettings();
}

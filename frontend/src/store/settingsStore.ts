import { create } from 'zustand';
import api from '../services/api';
import type { HeroPosition, HeroType } from '../lib/constants';

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

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  // Start as false — DEFAULT_SETTINGS provides safe fallbacks for every key,
  // so components can render immediately and update in-place when the API
  // responds. This eliminates the skeleton → content height shift (CLS).
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/settings');
      if (res.data.status === 'ok') {
        // Merge with defaults so new keys always have a safe value
        set({ settings: { ...DEFAULT_SETTINGS, ...res.data.data } });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.put('/settings', data);
      if (res.data.status === 'ok') {
        set({ settings: { ...DEFAULT_SETTINGS, ...res.data.data } });
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));

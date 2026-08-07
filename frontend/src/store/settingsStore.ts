import { create } from "zustand";
import api from "../services/api";

interface SettingsState {
  settings: Record<string, string>;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: {
    siteName?: string;
    logoUrl?: string;
    faviconUrl?: string;
    heroImageUrl?: string;
    contactHeroType?: string;
    contactHeroUrl?: string;
    contactHeroTitle?: string;
    contactHeroSubtitle?: string;
    contactHeroPosition?: string;
    blogHeroType?: string;
    blogHeroUrl?: string;
    blogHeroTitle?: string;
    blogHeroSubtitle?: string;
    blogHeroPosition?: string;
    aboutHeroType?: string;
    aboutHeroUrl?: string;
    aboutHeroTitle?: string;
    aboutHeroSubtitle?: string;
    aboutHeroPosition?: string;
    portfolioHeroType?: string;
    portfolioHeroUrl?: string;
    portfolioHeroTitle?: string;
    portfolioHeroSubtitle?: string;
    portfolioHeroPosition?: string;
    servicesHeroType?: string;
    servicesHeroUrl?: string;
    servicesHeroTitle?: string;
    servicesHeroSubtitle?: string;
    servicesHeroPosition?: string;
    pricingHeroType?: string;
    pricingHeroUrl?: string;
    pricingHeroTitle?: string;
    pricingHeroSubtitle?: string;
    pricingHeroPosition?: string;
    ctaSlideImages?: string;
    ctaSlideInterval?: string;
  }) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/settings");
      if (response.data.status === "ok") {
        set({ settings: response.data.data });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.put("/settings", data);
      if (response.data.status === "ok") {
        set({ settings: response.data.data });
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

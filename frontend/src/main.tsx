import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './i18n';
import './index.css';

// ---------------------------------------------------------------------------
// LCP fix: inject <link rel="preload"> untuk hero image dari localStorage cache
// sebelum React render. Ini memberitahu browser untuk mulai download gambar
// secepat mungkin — tanpa menunggu React render HeroSection dan membaca srcSet.
//
// Pada kunjungan pertama: tidak ada cache → browser download /hero-mockup.png
// yang sudah di-preload di index.html.
// Pada kunjungan berikutnya: heroImageUrl dari cache tersedia di sini, browser
// mulai download gambar CMS sejak awal eksekusi JS — bukan setelah React render.
// ---------------------------------------------------------------------------
(function injectHeroPreload() {
  try {
    const raw = localStorage.getItem('vividev_settings_cache');
    if (!raw) return;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return;
    const data = (parsed as { data?: unknown }).data;
    if (!data || typeof data !== 'object') return;
    const heroUrl = (data as Record<string, unknown>).heroImageUrl;
    if (typeof heroUrl !== 'string' || !heroUrl) return;
    if (!/^\/uploads\/[^/?#]+$/.test(heroUrl)) return;

    // Gunakan ukuran 1200w sebagai default src (sama dengan responsiveSrc)
    const filename = heroUrl.split('/').pop();
    // Guard: pop() bisa undefined jika string kosong (sangat jarang tapi defensive)
    if (!filename) return;

    // Hapus preload fallback /hero-mockup.png yang sudah ada di index.html
    // agar browser tidak download dua gambar sekaligus di critical path
    const existing = document.querySelector('link[rel="preload"][href="/hero-mockup.png"]');
    if (existing) existing.remove();

    const link = document.createElement('link');
    link.rel  = 'preload';
    link.as   = 'image';
    link.href = `/uploads/opt/1200/${filename}`;
    link.setAttribute('imagesrcset',
      [320, 480, 640, 800, 1200, 1600]
        .map(w => `/uploads/opt/${w}/${filename} ${w}w`)
        .join(', ')
    );
    link.setAttribute('imagesizes', '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px');
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  } catch {
    // localStorage tidak tersedia (private mode, dll) atau JSON corrupt — abaikan
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>}>
          <App />
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

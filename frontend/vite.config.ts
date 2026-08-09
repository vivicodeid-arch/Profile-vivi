import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ---------------------------------------------------------------------------
// Strip modulepreload hints for admin chunks from the built index.html.
//
// Vite injects `<link rel="modulepreload">` for every chunk reachable from
// the entry point — including lazy-loaded admin chunks. That causes browsers
// to eagerly download the admin editor (~110 KB) and admin shell (~27 KB) on
// every public page visit, even though they're only needed behind /admin.
//
// This plugin removes those specific modulepreload tags after Vite generates
// the HTML, keeping preloads only for public-facing chunks (vendor, react,
// i18n) which are needed on every page.
// ---------------------------------------------------------------------------
function stripAdminPreloads(): Plugin {
  return {
    name: 'strip-admin-modulepreloads',
    transformIndexHtml(html) {
      // Remove modulepreload for any chunk whose filename starts with "admin"
      return html.replace(
        /<link rel="modulepreload"[^>]*href="[^"]*\/admin[^"]*"[^>]*>\n?/g,
        '',
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), stripAdminPreloads()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Warn when any individual chunk exceeds 400 kB (uncompressed)
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Admin-only: Tiptap rich-text editor (~500 kB) ──────────────────
          // These modules are only imported by admin/* pages (lazy-loaded),
          // so they must NEVER land in the public bundle.
          if (
            id.includes('@tiptap') ||
            id.includes('prosemirror')
          ) {
            return 'admin-editor';
          }

          // ── Admin shell (layout + all admin pages) ─────────────────────────
          if (id.includes('/src/admin/')) {
            return 'admin';
          }

          // ── i18n runtime ───────────────────────────────────────────────────
          if (
            id.includes('i18next') ||
            id.includes('react-i18next')
          ) {
            return 'i18n';
          }

          // ── React core — harus tersedia sebelum apapun bisa render ─────────
          // Pisahkan dari vendor agar browser bisa parallel-preload chunk ini
          // bersama dengan chunk halaman utama. Memotong ~15-25ms parse time
          // dari critical path karena chunk lebih kecil dan lebih fokus.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-core';
          }

          // ── Router — dibutuhkan di setiap halaman public ───────────────────
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }

          // ── State management — zustand sangat kecil, gabung dengan router ──
          if (id.includes('node_modules/zustand')) {
            return 'router';
          }

          // ── Remaining node_modules → shared vendor chunk ───────────────────
          // (lucide-react, axios, dll — dibutuhkan tapi tidak sekritis react core)
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});

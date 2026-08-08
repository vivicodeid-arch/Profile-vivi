import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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

          // ── Core React vendor ──────────────────────────────────────────────
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/')
          ) {
            return 'vendor-react';
          }

          // ── Remaining node_modules → shared vendor chunk ───────────────────
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});

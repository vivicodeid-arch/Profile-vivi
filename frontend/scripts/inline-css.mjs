// ---------------------------------------------------------------------------
// Post-build step: inline the entry CSS into index.html
//
// Vite emits `<link rel="stylesheet" href="/assets/index-*.css">` which is a
// render-blocking request. For a small app CSS (~15 KB transfer) the cleanest
// fix is to inline it into a <style> tag, removing the extra request from the
// critical path (Lighthouse: "Eliminate render-blocking resources").
//
// The hashed CSS is unchanged, so this stays correct across rebuilds.
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url).pathname;
const htmlPath = join(distDir, 'index.html');

let html;
try {
  html = readFileSync(htmlPath, 'utf8');
} catch {
  console.error('[inline-css] dist/index.html not found. Skipping.');
  process.exit(0);
}

// <link rel="stylesheet" crossorigin href="/assets/index-XXXX.css">
const LINK_RE = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*\.css)["'][^>]*\/?>|<style>[\s\S]*?<\/style>/;

const match = html.match(LINK_RE);
if (!match) {
  console.error('[inline-css] No stylesheet link found. Skipping.');
  process.exit(0);
}

const href = match[1];
if (!href) {
  console.error('[inline-css] Stylesheet link has no href. Skipping.');
  process.exit(0);
}

const cssPath = join(distDir, href.replace(/^\//, ''));
let css;
try {
  css = readFileSync(cssPath, 'utf8');
} catch {
  console.error(`[inline-css] Could not read ${cssPath}. Skipping.`);
  process.exit(1);
}

// Inline the CSS and drop the external <link> from the head.
html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*\/?>/g, `<style>\n${css.trim()}\n</style>`);

writeFileSync(htmlPath, html);
console.log(`[inline-css] Inlined ${(css.length / 1024).toFixed(1)} KB of CSS into index.html`);
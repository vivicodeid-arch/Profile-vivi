// ---------------------------------------------------------------------------
// Responsive / resized image helpers
//
// CMS image URLs look like `/uploads/<uuid>.<ext>`. The backend exposes an
// on-demand resize proxy at `/uploads/opt/<width>/<uuid>.<ext>` that uses
// sharp to emit a WebP of the requested width (and caches it). These helpers
// rewrite any `/uploads/...` URL into the matching resized variants so the
// browser can download exactly the bytes it needs (fixes "image larger than
// needed" and the preload/LCP cost of full-size CMS uploads).
// ---------------------------------------------------------------------------

/** Widths (in CSS px) for which the backend can generate resized WebP. */
export const RESPONSIVE_WIDTHS = [320, 480, 640, 800, 1200, 1600];

const RASTER_RE = /\.(jpe?g|png|webp)$/i;

/**
 * True when `url` is a CMS path we can resize server-side.
 * External/absolute URLs and SVG/GIF (which must not lose animation/vector
 * data) are returned untouched.
 */
export function canResize(url?: string): boolean {
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) return false;
  // Only rewrite bare /uploads/... files
  if (!/^\/uploads\/[^/?#]+$/.test(url)) return false;
  return RASTER_RE.test(url);
}

/**
 * Builds a src/srcSet pair for an arbitrary CMS image URL.
 *
 * - Non-resizable URLs (SVG/GIF/absolute/3rd-party) fall back to the plain src.
 * - Resizable `/uploads/<file>.<ext>` URLs produce a srcSet across
 *   RESPONSIVE_WIDTHS (served as WebP by the `/uploads/opt/<w>/<file>` proxy)
 *   and a default `src` at 1200w — enough for the biggest hero on retina.
 */
export function responsiveSrc(
  url: string | undefined,
): { src: string | undefined; srcSet: string | undefined } {
  if (!canResize(url)) return { src: url, srcSet: undefined };

  const filename = url!.split('/').pop();
  const variants = RESPONSIVE_WIDTHS.map(w => `/uploads/opt/${w}/${filename} ${w}w`);

  return {
    src: `/uploads/opt/1200/${filename}`,
    srcSet: variants.join(', '),
  };
}

/**
 * Returns a specific WebP proxy URL for a given CMS image,
 * useful for small elements like logos to avoid loading the full-size default.
 */
export function getOptUrl(url: string | undefined, width: number = 320): string | undefined {
  if (!canResize(url)) return url;
  const filename = url!.split('/').pop();
  return `/uploads/opt/${width}/${filename}`;
}
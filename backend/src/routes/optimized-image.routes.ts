import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { env } from '../config/env';

// ---------------------------------------------------------------------------
// On-demand image resize proxy
//
// GET /uploads/opt/:width/:filename
//
// Serves a WebP version of any uploaded raster image at the requested width,
// using sharp. Dimensions are generated on first request and cached to disk
// so subsequent hits are plain static reads. Because every uploaded filename
// is a UUID, the output is immutable and safe to cache for a year.
//
// This is what makes the frontend's responsive <img srcSet> work for CMS
// images — the browser requests exactly the width it needs instead of the
// full-resolution original.
// ---------------------------------------------------------------------------

/** Widths the frontend asks for. Anything else 404s (no arbitrary resizing). */
const ALLOWED_WIDTHS = new Set([320, 480, 640, 800, 1200, 1600]);

const router = Router();

const CACHE_SUBDIR = 'optimized';

function safeFilename(filename: string): string {
  // UUID filenames like "8b5c90e0-0b45-4ae9-acd6-2901c73003bc.webp"
  if (!/^[\w-]+\.(jpe?g|png|webp)$/i.test(filename)) return '';
  return filename;
}

router.get('/opt/:width/:filename', async (req: Request, res: Response, next) => {
  try {
    const width = Number(req.params.width);
    if (!ALLOWED_WIDTHS.has(width)) {
      res.status(404).json({ status: 'error', message: 'Invalid width' });
      return;
    }

    const filename = safeFilename(req.params.filename);
    if (!filename) {
      res.status(404).json({ status: 'error', message: 'Invalid filename' });
      return;
    }

    const uploadDir = path.resolve(env.UPLOAD_DIR);
    const srcPath   = path.join(uploadDir, filename);
    if (!fs.existsSync(srcPath)) {
      res.status(404).json({ status: 'error', message: 'Not found' });
      return;
    }

    // Cache dir: <UPLOAD_DIR>/optim/640/8b5c90e0-....webp
    const cacheDir  = path.join(uploadDir, CACHE_SUBDIR, String(width));
    const cacheName = filename.replace(/\.(jpe?g|png|webp)$/i, '');
    const cachePath = path.join(cacheDir, `${cacheName}-${width}.webp`);
    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cacheDir, { recursive: true });
      await sharp(srcPath)
        .resize({ width, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(cachePath);
    }

    // Immutable: filename content is derived from a UUID + fixed width
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(cachePath);
  } catch (err) {
    next(err);
  }
});

export default router;
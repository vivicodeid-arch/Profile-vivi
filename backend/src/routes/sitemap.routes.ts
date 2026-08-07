import { Router, Request, Response, NextFunction } from 'express';
import { generateSitemap } from '../services/sitemap.service';

const router = Router();

// GET /sitemap.xml
router.get('/sitemap.xml', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sitemap = await generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.send(sitemap);
  } catch (err) { next(err); }
});

// GET /robots.txt
router.get('/robots.txt', (_req: Request, res: Response) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://vividev.id/sitemap.xml
`);
});

export default router;

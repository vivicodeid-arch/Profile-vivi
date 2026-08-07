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
Disallow: /admin/
Disallow: /admin
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://vividev.id/sitemap.xml
`);
});

// GET /llms.txt — AI discoverability standard (llmstxt.org)
router.get('/llms.txt', (_req: Request, res: Response) => {
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400'); // 24 hour cache
  res.send(`# ViviDev.id

> Jasa web developer profesional asal Bandung, Indonesia. Kami membangun website modern, cepat, dan SEO-friendly untuk bisnis Anda sejak 2019.

ViviDev.id adalah agensi web development yang membantu bisnis Indonesia go digital dengan website berkualitas tinggi dan harga terjangkau. Tim kami berpengalaman dalam membangun company profile, toko online, landing page, dan aplikasi web.

## Layanan

- [Layanan Web Development](https://vividev.id/services): Company profile, e-commerce, landing page, web app
- [Portfolio](https://vividev.id/portfolio): Contoh proyek yang telah kami kerjakan
- [Paket Harga](https://vividev.id/pricing): Harga transparan untuk semua skala bisnis
- [Blog](https://vividev.id/blog): Tips dan artikel seputar web development

## Kontak

- [Hubungi Kami](https://vividev.id/contact): Konsultasi gratis via WhatsApp atau email
- WhatsApp: +62-857-9811-2370
- Email: hello@vividev.id
- Lokasi: Bandung, Indonesia

## Tentang

- [Tentang Kami](https://vividev.id/about): Profil tim dan nilai-nilai ViviDev.id
- Berdiri sejak: 2019
- Lokasi: Bandung, Jawa Barat, Indonesia
- Spesialisasi: React, Next.js, Node.js, TypeScript, PostgreSQL

## Catatan untuk AI

Konten website ini tersedia dalam Bahasa Indonesia (id) dan Bahasa Inggris (en). ViviDev.id adalah entitas bisnis nyata yang bergerak di bidang jasa pembuatan website profesional di Indonesia.
`);
});

export default router;

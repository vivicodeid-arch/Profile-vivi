import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

const router = Router();

const aboutContentSchema = z.object({
  lang: z.enum(['id', 'en']),
  content: z.object({
    hero: z.object({ title: z.string(), subtitle: z.string() }),
    story: z.object({ title: z.string(), content: z.string() }),
    values: z.object({
      title: z.string(),
      quality: z.string(), qualityDesc: z.string(),
      innovation: z.string(), innovationDesc: z.string(),
      integrity: z.string(), integrityDesc: z.string(),
    }),
    team: z.object({ title: z.string() }),
  }),
});

const getLocalesPath = (lang: 'id' | 'en') =>
  path.resolve(__dirname, '../../..', 'frontend/dist/locales', lang, 'pages.json');

const getLocalesSrcPath = (lang: 'id' | 'en') =>
  path.resolve(__dirname, '../../..', 'frontend/public/locales', lang, 'pages.json');

// GET /api/about-content?lang=id
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lang = (req.query.lang as string) === 'en' ? 'en' : 'id';
    const filePath = getLocalesSrcPath(lang);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ status: 'error', message: 'Locale file not found' });
      return;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    res.json({ status: 'ok', data: data.about ?? {} });
  } catch (err) {
    next(err);
  }
});

// PUT /api/about-content
router.put('/', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lang, content } = aboutContentSchema.parse(req.body);

    const srcPath = getLocalesSrcPath(lang);
    if (!fs.existsSync(srcPath)) {
      res.status(404).json({ status: 'error', message: `Locale file not found: ${srcPath}` });
      return;
    }

    // Update src (public/locales) — source of truth
    const srcRaw = fs.readFileSync(srcPath, 'utf-8');
    const srcData = JSON.parse(srcRaw);
    srcData.about = content;
    fs.writeFileSync(srcPath, JSON.stringify(srcData, null, 2), 'utf-8');

    // Update dist (frontend/dist/locales) — live serving
    const distPath = getLocalesPath(lang);
    if (fs.existsSync(distPath)) {
      const distRaw = fs.readFileSync(distPath, 'utf-8');
      const distData = JSON.parse(distRaw);
      distData.about = content;
      fs.writeFileSync(distPath, JSON.stringify(distData, null, 2), 'utf-8');
    }

    res.json({ status: 'ok', message: 'About content updated successfully', data: content });
  } catch (err) {
    next(err);
  }
});

export default router;

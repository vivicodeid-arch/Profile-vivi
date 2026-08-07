import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Accepts absolute URLs (https://...) or relative paths (/uploads/...)
const urlOrPath = z.string().refine(
  (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
  { message: 'Must be a valid URL or a relative path starting with /' }
);

const portfolioSchema = z.object({
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  description: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  category: z.string().min(1),
  imageUrl: urlOrPath,
  projectUrl: urlOrPath.optional().or(z.literal('')),
  techStack: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

// GET /api/portfolio - Public
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const portfolios = await prisma.portfolio.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    });
    res.json({ status: 'ok', data: portfolios });
  } catch (err) { next(err); }
});

// GET /api/portfolio/:id - Public
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolio = await prisma.portfolio.findUnique({ where: { id: req.params.id } });
    if (!portfolio) throw new AppError(404, 'Portfolio not found');
    res.json({ status: 'ok', data: portfolio });
  } catch (err) { next(err); }
});

// POST /api/portfolio - Admin
router.post('/', authenticate, validate(portfolioSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolio = await prisma.portfolio.create({ data: req.body });
    res.status(201).json({ status: 'ok', data: portfolio });
  } catch (err) { next(err); }
});

// PUT /api/portfolio/:id - Admin
router.put('/:id', authenticate, validate(portfolioSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolio = await prisma.portfolio.update({ where: { id: req.params.id }, data: req.body });
    res.json({ status: 'ok', data: portfolio });
  } catch (err) { next(new AppError(404, 'Portfolio not found')); }
});

// DELETE /api/portfolio/:id - Admin
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.portfolio.delete({ where: { id: req.params.id } });
    res.json({ status: 'ok', message: 'Portfolio deleted' });
  } catch (err) { next(new AppError(404, 'Portfolio not found')); }
});

export default router;

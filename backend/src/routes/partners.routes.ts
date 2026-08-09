import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

const partnerSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().min(1),
  websiteUrl: z.string().optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

// GET /api/partners - public
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const partners = await prisma.partner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ status: 'ok', data: partners });
  } catch (err) {
    next(err);
  }
});

// GET /api/partners/all - admin (includes inactive)
router.get('/all', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const partners = await prisma.partner.findMany({ orderBy: { order: 'asc' } });
    res.json({ status: 'ok', data: partners });
  } catch (err) {
    next(err);
  }
});

// POST /api/partners - admin
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = partnerSchema.parse(req.body);
    const partner = await prisma.partner.create({ data });
    res.status(201).json({ status: 'ok', data: partner });
  } catch (err) {
    next(err);
  }
});

// PUT /api/partners/:id - admin
router.put('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = partnerSchema.partial().parse(req.body);
    const partner = await prisma.partner.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ status: 'ok', data: partner });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/partners/:id - admin
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.partner.delete({ where: { id: req.params.id } });
    res.json({ status: 'ok', message: 'Partner deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;

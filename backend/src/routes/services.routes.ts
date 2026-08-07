import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

const serviceSchema = z.object({
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  description: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  icon: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
  order: z.number().default(0),
  active: z.boolean().default(true),
});

// GET /api/services - Public
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ status: 'ok', data: services });
  } catch (err) { next(err); }
});

// POST /api/services - Admin
router.post('/', authenticate, validate(serviceSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await prisma.service.create({ data: req.body });
    res.status(201).json({ status: 'ok', data: service });
  } catch (err) { next(err); }
});

// PUT /api/services/:id - Admin
router.put('/:id', authenticate, validate(serviceSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await prisma.service.update({ where: { id: req.params.id }, data: req.body });
    res.json({ status: 'ok', data: service });
  } catch (err) { next(new AppError(404, 'Service not found')); }
});

// DELETE /api/services/:id - Admin
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ status: 'ok', message: 'Service deleted' });
  } catch (err) { next(new AppError(404, 'Service not found')); }
});

export default router;

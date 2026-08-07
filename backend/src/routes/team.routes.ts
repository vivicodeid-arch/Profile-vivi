import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Accepts absolute URLs or relative paths (/uploads/...) or empty string
const urlOrPath = z.string().refine(
  (val) => val === '' || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
  { message: 'Must be a valid URL or a relative path starting with /' }
);

const teamSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  bio: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  photo: urlOrPath.optional().or(z.literal('')),
  linkedIn: z.string().url().optional().or(z.literal('')),
  order: z.number().default(0),
  active: z.boolean().default(true),
});

// GET /api/team - Public
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.teamMember.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ status: 'ok', data: members });
  } catch (err) { next(err); }
});

// GET /api/team/all - Admin (includes inactive)
router.get('/all', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.teamMember.findMany({ orderBy: { order: 'asc' } });
    res.json({ status: 'ok', data: members });
  } catch (err) { next(err); }
});

// POST /api/team - Admin
router.post('/', authenticate, validate(teamSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await prisma.teamMember.create({
      data: {
        ...req.body,
        photo: req.body.photo || null,
        linkedIn: req.body.linkedIn || null,
      },
    });
    res.status(201).json({ status: 'ok', data: member });
  } catch (err) { next(err); }
});

// PUT /api/team/:id - Admin
router.put('/:id', authenticate, validate(teamSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await prisma.teamMember.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        photo: req.body.photo || null,
        linkedIn: req.body.linkedIn || null,
      },
    });
    res.json({ status: 'ok', data: member });
  } catch (err) { next(new AppError(404, 'Team member not found')); }
});

// DELETE /api/team/:id - Admin
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.teamMember.delete({ where: { id: req.params.id } });
    res.json({ status: 'ok', message: 'Team member deleted' });
  } catch (err) { next(new AppError(404, 'Team member not found')); }
});

export default router;

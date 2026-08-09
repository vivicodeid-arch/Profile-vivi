import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';

const router = Router();

// Accepts absolute URLs (https://...) or relative paths (/uploads/...) or empty string
const urlOrPath = z.string().refine(
  (val) => val === '' || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
  { message: 'Must be a valid URL or a relative path starting with /' }
);

const postSchema = z.object({
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  content: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  excerpt: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  metaTitle: z.object({ id: z.string(), en: z.string() }),
  metaDesc: z.object({ id: z.string(), en: z.string() }),
  coverImage: urlOrPath.optional().or(z.literal('')),
  published: z.boolean().default(false),
});

// GET /api/blog - Public list; ?all=true requires authentication to include drafts
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Only authenticated requests may fetch drafts
    const requestsAll = req.query.all === 'true';
    let isAdmin = false;
    if (requestsAll) {
      try {
        const token = req.cookies?.access_token;
        if (token) {
          jwt.verify(token, env.JWT_SECRET);
          isAdmin = true;
        }
      } catch {
        // Invalid / missing token — treat as public request
      }
    }
    const all = requestsAll && isAdmin;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: all ? undefined : { published: true },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true, published: true },
      }),
      prisma.post.count({ where: all ? undefined : { published: true } }),
    ]);
    res.json({ status: 'ok', data: posts, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// GET /api/blog/:slug - Public single
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findUnique({ where: { slug: req.params.slug } });
    if (!post) throw new AppError(404, 'Post not found');
    res.json({ status: 'ok', data: post });
  } catch (err) { next(err); }
});

// POST /api/blog - Admin
router.post('/', authenticate, validate(postSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.create({
      data: {
        ...req.body,
        coverImage: req.body.coverImage || null,
        publishedAt: req.body.published ? new Date() : null,
      },
    });
    res.status(201).json({ status: 'ok', data: post });
  } catch (err) { next(err); }
});

// PUT /api/blog/:id - Admin
router.put('/:id', authenticate, validate(postSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        coverImage: req.body.coverImage || null,
        publishedAt: req.body.published ? new Date() : null,
      },
    });
    res.json({ status: 'ok', data: post });
  } catch (err) { next(new AppError(404, 'Post not found')); }
});

// DELETE /api/blog/:id - Admin
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ status: 'ok', message: 'Post deleted' });
  } catch (err) { next(new AppError(404, 'Post not found')); }
});

export default router;

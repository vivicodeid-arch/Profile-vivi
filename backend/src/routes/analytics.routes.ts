import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import { getAnalyticsSummary } from '../services/analytics.service';
import { recordPageView } from '../services/analytics.service';

const router = Router();
const prisma = new PrismaClient();

// POST /api/analytics/track - Public (called from frontend)
router.post('/track', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { path, referrer } = req.body;
    if (!path || typeof path !== 'string') {
      res.status(400).json({ status: 'error', message: 'Path is required' });
      return;
    }
    // Skip admin paths
    if (path.startsWith('/admin')) {
      res.json({ status: 'ok' });
      return;
    }
    await recordPageView(path, referrer, req.headers['user-agent'], req.ip);
    res.json({ status: 'ok' });
  } catch (err) { next(err); }
});

// GET /api/analytics/summary - Admin only
router.get('/summary', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await getAnalyticsSummary();
    res.json({ status: 'ok', data: summary });
  } catch (err) { next(err); }
});

// GET /api/analytics/contacts - Admin only
router.get('/contacts', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactSubmission.count(),
    ]);
    res.json({ status: 'ok', data: submissions, meta: { page, limit, total } });
  } catch (err) { next(err); }
});

export default router;

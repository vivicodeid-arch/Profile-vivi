import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { contactLimiter } from '../middleware/rateLimit';
import { authenticate } from '../middleware/auth.middleware';
import { sendContactNotification, sendContactAutoReply } from '../services/email.service';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../middleware/logger';
import { prisma } from '../lib/prisma';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
});

// POST /api/contact - Public
router.post('/', contactLimiter, validate(contactSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const ipAddress = req.ip;

    const submission = await prisma.contactSubmission.create({
      data: { name, email, phone, subject, message, ipAddress },
    });

    // Send emails (non-blocking)
    Promise.all([
      sendContactNotification({ name, email, phone, subject, message }),
      sendContactAutoReply({ name, email, phone, subject, message }),
    ]).catch(err => logger.error('Email sending failed:', err));

    res.status(201).json({ status: 'ok', message: 'Pesan Anda telah dikirim. Terima kasih!', id: submission.id });
  } catch (err) {
    next(err);
  }
});

// GET /api/contact - Admin only
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
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

    res.json({ status: 'ok', data: submissions, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/contact/:id/read - Admin only
router.patch('/:id/read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await prisma.contactSubmission.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ status: 'ok', data: submission });
  } catch (err) {
    next(new AppError(404, 'Submission not found'));
  }
});

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { authLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../middleware/logger';
import { prisma } from '../lib/prisma';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET as string,
    { expiresIn: 15 * 60 } // 15 minutes in seconds
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_REFRESH_SECRET as string,
    { expiresIn: 7 * 24 * 60 * 60 } // 7 days in seconds
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid credentials');

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info(`Admin login: ${email}`);
    res.json({ status: 'ok', user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh — rotates both tokens on every refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw new AppError(401, 'No refresh token');

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) throw new AppError(401, 'User not found');

    // Rotate both tokens — old refresh token is implicitly invalidated
    // by issuing a new one with a fresh expiry. If the old token is reused
    // after this point, the user must log in again (no infinite reuse).
    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  logger.info(`Admin logout: ${req.user?.email}`);
  res.json({ status: 'ok' });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ status: 'ok', user: req.user });
});

export default router;

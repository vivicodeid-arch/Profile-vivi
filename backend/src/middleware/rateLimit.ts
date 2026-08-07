import rateLimit from 'express-rate-limit';
import { logger } from './logger';

// General API rate limit
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
  handler: (req, _res, _next, options) => {
    logger.warn(`Rate limit exceeded: ${req.ip} - ${req.originalUrl}`);
    _res.status(options.statusCode).json(options.message);
  },
});

// Strict limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many login attempts, please try again in 15 minutes.' },
  handler: (req, _res, _next, options) => {
    logger.warn(`Auth rate limit exceeded: ${req.ip}`);
    _res.status(options.statusCode).json(options.message);
  },
});

// Contact form limit
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many contact submissions, please try again later.' },
});

// Upload limit
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Upload limit reached, please try again later.' },
});

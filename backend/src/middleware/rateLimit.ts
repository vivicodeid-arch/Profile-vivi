import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { logger } from './logger';
import { env } from '../config/env';

// ---------------------------------------------------------------------------
// Redis client — shared for rate limiting across all PM2 instances/restarts.
// Falls back gracefully to in-memory if Redis is unavailable.
// ---------------------------------------------------------------------------
const redisClient = new Redis(env.REDIS_URL, { lazyConnect: true });
redisClient.connect().catch((err: Error) => {
  logger.warn(`Rate limit Redis connection failed, falling back to in-memory: ${err.message}`);
});

function makeStore() {
  if (redisClient.status === 'ready') {
    return new RedisStore({
      // rate-limit-redis v4 uses sendCommand; ioredis uses call()
      sendCommand: (...args: string[]) =>
        redisClient.call(args[0], ...args.slice(1)) as unknown as Promise<import('rate-limit-redis').RedisReply>,
    });
  }
  // in-memory fallback (single-process only)
  return undefined;
}

// General API rate limit
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
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
  store: makeStore(),
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
  store: makeStore(),
  message: { status: 'error', message: 'Too many contact submissions, please try again later.' },
});

// Upload limit
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { status: 'error', message: 'Upload limit reached, please try again later.' },
});

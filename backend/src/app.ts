import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';

import { env } from './config/env';
import { requestLogger, logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimit';
import { sanitizeInput } from './middleware/sanitize';

import authRoutes from './routes/auth.routes';
import blogRoutes from './routes/blog.routes';
import portfolioRoutes from './routes/portfolio.routes';
import servicesRoutes from './routes/services.routes';
import teamRoutes from './routes/team.routes';
import contactRoutes from './routes/contact.routes';
import analyticsRoutes from './routes/analytics.routes';
import mediaRoutes from './routes/media.routes';
import sitemapRoutes from './routes/sitemap.routes';
import settingsRoutes from './routes/settings.routes';
import partnersRoutes from './routes/partners.routes';
import pricingRoutes from './routes/pricing.routes';
import aboutContentRoutes from './routes/about-content.routes';

const app = express();

// Trust proxy (Nginx)
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
  })
);

// CORS - whitelist only
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? [env.FRONTEND_URL] : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Cookie parsing
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use('/api/', generalLimiter);

// Static file serving for uploads
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR), { maxAge: '1d' }));

// Sitemap & robots (must be before /api prefix)
app.use('/', sitemapRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/about-content', aboutContentRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`ViviDev.id Backend running on port ${PORT} [${env.NODE_ENV}]`);
});

export default app;

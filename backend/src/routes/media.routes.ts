import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { optimize } from 'svgo';
import { authenticate } from '../middleware/auth.middleware';
import { uploadLimiter } from '../middleware/rateLimit';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';

const router = Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = env.MAX_FILE_SIZE_MB * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.resolve(env.UPLOAD_DIR);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, 'File type not allowed. Only images are permitted.'));
    }
  },
});

// POST /api/media - Upload (Admin)
router.post('/', authenticate, uploadLimiter, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError(400, 'No file uploaded');
    
    const filePath = path.resolve(env.UPLOAD_DIR, req.file.filename);
    
    if (req.file.mimetype === 'image/svg+xml') {
      try {
        const svgData = fs.readFileSync(filePath, 'utf8');
        const result = optimize(svgData, {
          path: filePath,
          multipass: true,
        });
        fs.writeFileSync(filePath, result.data);
        const stat = fs.statSync(filePath);
        req.file.size = stat.size;
      } catch (err) {
        console.error('Failed to optimize SVG:', err);
      }
    }

    const url = `/uploads/${req.file.filename}`;
    const media = await prisma.media.create({
      data: {
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url,
        alt: (req.body.alt as string) || '',
      },
    });
    res.status(201).json({ status: 'ok', data: media });
  } catch (err) { next(err); }
});

// GET /api/media - List (Admin)
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [media, total] = await Promise.all([
      prisma.media.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.media.count(),
    ]);
    res.json({ status: 'ok', data: media, meta: { page, limit, total } });
  } catch (err) { next(err); }
});

// DELETE /api/media/:id - Admin
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!media) throw new AppError(404, 'Media not found');
    const filePath = path.resolve(env.UPLOAD_DIR, media.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.media.delete({ where: { id: req.params.id } });
    res.json({ status: 'ok', message: 'Media deleted' });
  } catch (err) { next(err); }
});

export default router;

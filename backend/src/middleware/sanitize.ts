import { Request, Response, NextFunction } from 'express';

/**
 * Fields that are allowed to contain HTML content (e.g. rich-text blog editor).
 * These keys are excluded from HTML-stripping sanitization.
 */
const HTML_ALLOWED_FIELDS = new Set(['content', 'body', 'html', 'excerpt']);

/**
 * Recursively sanitize string values in an object.
 * - Always strips <script> tags from every field.
 * - Strips all other HTML tags ONLY for fields not in HTML_ALLOWED_FIELDS.
 */
const sanitizeValue = (value: unknown, key?: string): unknown => {
  if (typeof value === 'string') {
    // Always remove script tags — no exception
    let sanitized = value.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      '',
    );
    // Strip remaining HTML only for non-rich-text fields
    if (!key || !HTML_ALLOWED_FIELDS.has(key)) {
      sanitized = sanitized.replace(/<[^>]+>/g, '');
    }
    return sanitized.trim();
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeValue(v, k)]),
    );
  }
  return value;
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  next();
};

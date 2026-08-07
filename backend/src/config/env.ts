import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Email SMTP
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().default('465').transform(Number),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  SMTP_SECURE: z.string().default('true').transform(v => v === 'true'),
  CONTACT_EMAIL_TO: z.string().email(),

  // WhatsApp
  WA_NUMBER: z.string().default('6285798112370'),

  // Upload
  MAX_FILE_SIZE_MB: z.string().default('5').transform(Number),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

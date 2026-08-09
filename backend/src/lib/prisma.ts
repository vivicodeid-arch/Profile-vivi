import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient — satu instance untuk seluruh aplikasi.
// Mencegah connection pool exhaustion akibat multiple PrismaClient instances
// yang dibuat di setiap route file.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  // Simpan di global agar hot-reload (tsx watch) tidak membuat instance baru
  globalForPrisma.prisma = prisma;
}

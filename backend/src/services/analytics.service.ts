import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const recordPageView = async (
  path: string,
  referrer?: string,
  userAgent?: string,
  ip?: string
): Promise<void> => {
  // Hash IP for privacy compliance
  const ipHash = ip
    ? crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex').slice(0, 16)
    : undefined;

  await prisma.pageView.create({
    data: { path, referrer, userAgent, ipHash },
  });
};

export const getAnalyticsSummary = async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7 = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const last30 = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

  const [todayViews, week7Views, month30Views, topPages, dailyTrend, contactStats] =
    await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: today } } }),
      prisma.pageView.count({ where: { createdAt: { gte: last7 } } }),
      prisma.pageView.count({ where: { createdAt: { gte: last30 } } }),

      // Top pages last 30 days
      prisma.pageView.groupBy({
        by: ['path'],
        where: { createdAt: { gte: last30 } },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),

      // Daily trend last 7 days - raw query for date grouping
      prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT DATE("createdAt")::text as date, COUNT(*)::int as count
        FROM page_views
        WHERE "createdAt" >= ${last7}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,

      // Contact submissions
      prisma.contactSubmission.aggregate({
        _count: { id: true },
        where: {},
      }),
    ]);

  const unreadContacts = await prisma.contactSubmission.count({ where: { read: false } });

  return {
    pageViews: { today: todayViews, last7Days: week7Views, last30Days: month30Views },
    topPages: topPages.map((p: { path: string; _count: { path: number } }) => ({ path: p.path, views: p._count.path })),
    dailyTrend,
    contacts: {
      total: contactStats._count.id,
      unread: unreadContacts,
    },
  };
};

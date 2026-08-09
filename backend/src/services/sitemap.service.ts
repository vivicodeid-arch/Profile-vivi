import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_URL = 'https://vividev.id';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

// Computed per-request so lastmod is always accurate
const getStaticRoutes = (): SitemapUrl[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { loc: '/',         changefreq: 'weekly',  priority: '1.0', lastmod: today },
    { loc: '/about',    changefreq: 'monthly', priority: '0.8', lastmod: today },
    { loc: '/services', changefreq: 'monthly', priority: '0.8', lastmod: today },
    { loc: '/portfolio',changefreq: 'weekly',  priority: '0.8', lastmod: today },
    { loc: '/blog',     changefreq: 'daily',   priority: '0.9', lastmod: today },
    { loc: '/contact',  changefreq: 'monthly', priority: '0.7', lastmod: today },
    { loc: '/pricing',  changefreq: 'monthly', priority: '0.7', lastmod: today },
  ];
};

export const generateSitemap = async (): Promise<string> => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  // Only include portfolio items with a non-empty, non-null slug
  const portfolios = await prisma.portfolio.findMany({
    where: {
      slug: { not: '' },
    },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const urls: SitemapUrl[] = [
    ...getStaticRoutes(),
    ...posts.map((p: { slug: string; updatedAt: Date }) => ({
      loc: `/blog/${p.slug}`,
      lastmod: p.updatedAt.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7',
    })),
    // slug is guaranteed non-null/non-empty by the Prisma where clause above,
    // but TypeScript doesn't narrow it — cast is safe here.
    ...portfolios.map((p: { slug: string | null; updatedAt: Date }) => ({
      loc: `/portfolio/${p.slug as string}`,
      lastmod: p.updatedAt.toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ];

  const urlEntries = urls
    .map(url => `
  <url>
    <loc>${BASE_URL}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_URL = 'https://vividev.id';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const TODAY = new Date().toISOString().split('T')[0];

const staticRoutes: SitemapUrl[] = [
  { loc: '/',         changefreq: 'weekly',  priority: '1.0', lastmod: TODAY },
  { loc: '/about',    changefreq: 'monthly', priority: '0.8', lastmod: TODAY },
  { loc: '/services', changefreq: 'monthly', priority: '0.8', lastmod: TODAY },
  { loc: '/portfolio',changefreq: 'weekly',  priority: '0.8', lastmod: TODAY },
  { loc: '/blog',     changefreq: 'daily',   priority: '0.9', lastmod: TODAY },
  { loc: '/contact',  changefreq: 'monthly', priority: '0.7', lastmod: TODAY },
  { loc: '/pricing',  changefreq: 'monthly', priority: '0.7', lastmod: TODAY },
];

export const generateSitemap = async (): Promise<string> => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const portfolios = await prisma.portfolio.findMany({
    select: { id: true, slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const urls: SitemapUrl[] = [
    ...staticRoutes,
    ...posts.map((p: { slug: string; updatedAt: Date }) => ({
      loc: `/blog/${p.slug}`,
      lastmod: p.updatedAt.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7',
    })),
    ...portfolios.map((p: { id: string; slug: string | null; updatedAt: Date }) => ({
      loc: `/portfolio/${p.slug || p.id}`,
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
};

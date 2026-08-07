import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowLeft } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import api from '../services/api';
import type { Post } from '../types';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'id' | 'en';
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/blog/${slug}`)
      .then(r => setPost(r.data.data))
      .catch(() => navigate('/blog', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );

  if (!post) return null;

  const title = (post.title as Record<string, string>)[lang];
  const content = (post.content as Record<string, string>)[lang];
  const excerpt = (post.excerpt as Record<string, string>)[lang];
  const metaTitle = (post.metaTitle as Record<string, string>)[lang] || title;
  const metaDesc = (post.metaDesc as Record<string, string>)[lang] || excerpt;
  const publishedDate = new Date(post.publishedAt || post.createdAt);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    image: post.coverImage || 'https://vividev.id/og-default.jpg',
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: 'ViviDev.id', url: 'https://vividev.id' },
    publisher: {
      '@type': 'Organization', name: 'ViviDev.id', url: 'https://vividev.id',
      logo: { '@type': 'ImageObject', url: 'https://vividev.id/logo.png' },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://vividev.id' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://vividev.id/blog' },
        { '@type': 'ListItem', position: 3, name: title, item: `https://vividev.id/blog/${slug}` },
      ],
    },
  };

  return (
    <>
      <SEOHead
        title={`${metaTitle} — ViviDev.id`}
        description={metaDesc}
        canonical={`/blog/${slug}`}
        ogImage={post.coverImage}
        ogType="article"
        schema={schema}
      />

      <div className="pt-24 pb-16 bg-white dark:bg-gray-950">
        <div className="container-custom max-w-4xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/" className="hover:text-primary-600">Home</Link></li>
              <li>/</li>
              <li><Link to="/blog" className="hover:text-primary-600">Blog</Link></li>
              <li>/</li>
              <li className="text-gray-900 dark:text-gray-100 truncate max-w-xs">{title}</li>
            </ol>
          </nav>

          {/* Back button */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-8">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Kembali ke Blog
          </Link>

          {/* Cover image */}
          {post.coverImage && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-gray-100 dark:bg-gray-800">
              <img src={post.coverImage} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Article header */}
          <header className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">{title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <time dateTime={post.publishedAt || post.createdAt}>
                  {publishedDate.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>
              <span>•</span>
              <span>ViviDev.id</span>
            </div>
          </header>

          {/* Article content */}
          <article
            className="prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-code:text-primary-700 dark:prose-code:text-primary-300 prose-code:bg-primary-50 dark:prose-code:bg-primary-900/30 prose-pre:bg-gray-900"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* CTA */}
          <div className="mt-16 p-8 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Butuh Website Profesional?</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Konsultasikan kebutuhan Anda dengan tim ViviDev.id, gratis!</p>
            <Link to="/contact" className="mt-6 inline-flex btn-primary">Hubungi Kami</Link>
          </div>
        </div>
      </div>
    </>
  );
}

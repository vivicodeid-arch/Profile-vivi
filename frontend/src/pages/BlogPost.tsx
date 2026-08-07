import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';
import { SEOHead } from '../components/seo/SEOHead';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';
import type { Post } from '../types';
import { SITE_URL, SITE_NAME } from '../lib/constants';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const { t, i18n } = useTranslation(['pages']);
  const lang = i18n.language as 'id' | 'en';

  const [post, setPost]       = useState<Post | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .get(`/blog/${slug}`)
      .then(r => setPost(r.data.data))
      .catch(() => navigate('/blog', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (isLoading) return <Spinner />;
  if (!post) return null;

  const title       = post.title[lang];
  const rawContent  = post.content[lang];
  const excerpt     = post.excerpt[lang];
  const metaTitle   = post.metaTitle[lang] || title;
  const metaDesc    = post.metaDesc[lang]   || excerpt;
  const publishedDate = new Date(post.publishedAt || post.createdAt);

  // Sanitise HTML before rendering
  const safeContent = DOMPurify.sanitize(rawContent);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    image: post.coverImage || `${SITE_URL}/og-default.jpg`,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author:    { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: title,   item: `${SITE_URL}/blog/${slug}` },
      ],
    },
  };

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDesc}
        canonical={`/blog/${slug}`}
        ogImage={post.coverImage}
        ogType="article"
        schema={schema}
      />

      <div className="pt-24 pb-16 bg-white dark:bg-gray-900">
        <div className="container-custom max-w-3xl">

          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {t('blog.backToList', { ns: 'pages' })}
          </Link>

          {/* Cover image */}
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={title}
              className="w-full h-64 md:h-80 object-cover rounded-2xl mb-8"
              loading="eager"
            />
          )}

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <time dateTime={publishedDate.toISOString()}>
                {publishedDate.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </time>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>
          </header>

          {/* Article body */}
          <article
            className="prose prose-lg max-w-none dark:prose-invert
              prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-a:text-primary-600 dark:prose-a:text-primary-400
              prose-code:text-primary-700 dark:prose-code:text-primary-300
              prose-code:bg-primary-50 dark:prose-code:bg-primary-900/30
              prose-pre:bg-gray-900"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />

          {/* CTA */}
          <div className="mt-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('blog.cta.title', { ns: 'pages' })}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('blog.cta.body', { ns: 'pages' })}
            </p>
            <Link to="/contact" className="mt-6 inline-flex btn-primary">
              {t('blog.cta.button', { ns: 'pages' })}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

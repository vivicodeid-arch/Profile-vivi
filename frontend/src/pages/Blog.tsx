import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import ErrorAlert from '../components/ui/ErrorAlert';
import { useApi } from '../hooks/useApi';
import type { Post } from '../types';
import { SITE_NAME, SITE_URL } from '../lib/constants';

function buildBlogSchema(posts: Post[], lang: 'id' | 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: lang === 'id' ? `Blog — ${SITE_NAME}` : `Blog — ${SITE_NAME}`,
    url: `${SITE_URL}/blog`,
    description: lang === 'id'
      ? 'Tips, tutorial, dan insight seputar web development dari tim ViviDev.id.'
      : 'Tips, tutorials, and insights about web development from the ViviDev.id team.',
    blogPost: posts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title[lang],
      description: post.excerpt?.[lang] ?? '',
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.publishedAt || post.createdAt,
      dateModified: post.updatedAt || post.createdAt,
      image: post.coverImage ?? undefined,
      author: { '@type': 'Organization', name: SITE_NAME },
    })),
  };
}


interface PostsResponse {
  data: Post[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export default function Blog() {
  const { t, i18n } = useTranslation(['pages', 'common']);
  const lang = i18n.language as 'id' | 'en';
  const [page, setPage] = useState(1);

  const { data: response, isLoading, error } = useApi<PostsResponse>(
    `/blog?page=${page}&limit=9`,
  );

  const posts = response?.data ?? [];
  const meta  = response?.meta;

  const schema = posts.length > 0 ? buildBlogSchema(posts, lang) : undefined;

  return (
    <>
      <SEOHead
        title={t('blog.meta.title')}
        description={t('blog.meta.description')}
        canonical="/blog"
        schema={schema}
      />

      <PageHero
        page="blog"
        titleKey="blog.hero.title"
        subtitleKey="blog.hero.subtitle"
      />

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          {isLoading && <Spinner />}

          {error && <ErrorAlert message={error} />}

          {!isLoading && !error && posts.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-16">
              {t('blog.empty', { ns: 'pages' })}
            </p>
          )}

          {posts.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => {
                  const title   = post.title[lang];
                  const excerpt = post.excerpt[lang];
                  const date    = new Date(post.publishedAt || post.createdAt);

                  return (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {post.coverImage && (
                        <Link to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
                          <img
                            src={post.coverImage}
                            alt={title}
                            className="w-full h-48 object-cover"
                            loading="lazy"
                          />
                        </Link>
                      )}

                      <div className="p-6">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                          <time dateTime={date.toISOString()}>
                            {date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })}
                          </time>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          <Link
                            to={`/blog/${post.slug}`}
                            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            {title}
                          </Link>
                        </h2>

                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                          {excerpt}
                        </p>

                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:gap-2.5 transition-all"
                        >
                          {t('blog.readMore', { ns: 'pages' })}
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {meta && meta.pages > 1 && (
                <nav className="mt-12 flex justify-center gap-2" aria-label="Pagination">
                  {Array.from({ length: meta.pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      aria-current={p === page ? 'page' : undefined}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

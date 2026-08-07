import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowRight } from "lucide-react";
import { SEOHead } from "../components/seo/SEOHead";
import { useSettingsStore } from "../store/settingsStore";
import api from "../services/api";
import type { Post } from "../types";

const POSITION_CSS: Record<string, string> = {
  "top-left":     "top left",
  "top":          "top center",
  "top-right":    "top right",
  "left":         "center left",
  "center":       "center center",
  "right":        "center right",
  "bottom-left":  "bottom left",
  "bottom":       "bottom center",
  "bottom-right": "bottom right",
};

function BlogHero() {
  const { settings } = useSettingsStore();
  const { t } = useTranslation(["pages"]);
  const heroType = settings.blogHeroType || "gradient";
  const heroUrl  = settings.blogHeroUrl  || "";
  const title    = settings.blogHeroTitle    || t("blog.hero.title");
  const subtitle = settings.blogHeroSubtitle || t("blog.hero.subtitle");
  const position = POSITION_CSS[settings.blogHeroPosition || "center"] || "center center";

  if (heroType === "image" && heroUrl) {
    return (
      <section className="relative pt-32 pb-16 text-white overflow-hidden min-h-[220px]">
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${heroUrl})`, backgroundPosition: position }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="container-custom relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-white/80 max-w-2xl">{subtitle}</p>
        </div>
      </section>
    );
  }

  if (heroType === "video" && heroUrl) {
    return (
      <section className="relative pt-32 pb-16 text-white overflow-hidden min-h-[220px]">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: position }}
          src={heroUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="container-custom relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-white/80 max-w-2xl">{subtitle}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container-custom">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-gray-300 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}

export default function Blog() {
  const { t, i18n } = useTranslation(["common", "pages"]);
  const lang = i18n.language as "id" | "en";
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/blog?page=${page}&limit=9`)
      .then(r => { setPosts(r.data.data || []); setMeta(r.data.meta); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog ViviDev.id",
    url: "https://vividev.id/blog",
    description: "Tips, tutorial, dan insight seputar web development.",
    publisher: { "@type": "Organization", name: "ViviDev.id", url: "https://vividev.id" },
  };

  return (
    <>
      <SEOHead
        title={t("blog.hero.title", { ns: "pages" })}
        description={t("blog.hero.subtitle", { ns: "pages" })}
        canonical="/blog"
        schema={schema}
      />

      <BlogHero />

      <section className="section-padding bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-20">{t("blog.noPost", { ns: "pages" })}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => (
                  <article key={post.id} className="card group overflow-hidden flex flex-col">
                    {post.coverImage && (
                      <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={post.coverImage}
                          alt={(post.title as any)[lang] || ""}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <time dateTime={post.publishedAt || post.createdAt}>
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </time>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                        {(post.title as any)[lang]}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 flex-1">
                        {(post.excerpt as any)[lang]}
                      </p>
                      <div className="mt-4">
                        <Link to={`/blog/${post.slug}`}
                          className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                          {t("cta.readMore")} <ArrowRight className="ml-1 w-4 h-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {meta.pages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {Array.from({ length: meta.pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-primary-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

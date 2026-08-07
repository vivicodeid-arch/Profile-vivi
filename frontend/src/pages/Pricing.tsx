import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { useSettingsStore } from '../store/settingsStore';
import api from '../services/api';

interface PricingFeature {
  id: string;
  text: Record<string, string>;
  included: boolean;
  order: number;
}

interface PricingPlan {
  id: string;
  name: string;
  label: Record<string, string>;
  subtitle: Record<string, string>;
  category: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  highlighted: boolean;
  ctaLabel: Record<string, string>;
  ctaUrl: string | null;
  badge: string | null;
  features: PricingFeature[];
}



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

function PricingHero() {
  const { settings } = useSettingsStore();
  const { t } = useTranslation(["pages"]);
  const heroType = settings.pricingHeroType || "gradient";
  const heroUrl  = settings.pricingHeroUrl  || "";
  const title    = settings.pricingHeroTitle    || t("pricing.hero.title");
  const subtitle = settings.pricingHeroSubtitle || t("pricing.hero.subtitle");
  const position = POSITION_CSS[settings.pricingHeroPosition || "center"] || "center center";

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
    <section className="pt-32 pb-16 bg-gradient-to-br from-primary-900 to-primary-700 text-white">
      <div className="container-custom">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-primary-200 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}
export default function Pricing() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'id' | 'en';
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState<'individual' | 'team'>('individual');

  useEffect(() => {
    api.get('/pricing')
      .then(r => setPlans(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter(p => p.category === category);

  const getPrice = (plan: PricingPlan): number | null => {
    if (plan.priceMonthly === null && plan.priceYearly === null) return null;
    if (billing === 'yearly' && plan.priceYearly !== null) return plan.priceYearly;
    return plan.priceMonthly;
  };

  const formatPrice = (plan: PricingPlan): string | null => {
    const price = getPrice(plan);
    if (price === null) return null;
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: plan.currency || 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const colsClass =
    filtered.length === 1
      ? 'grid-cols-1 max-w-sm mx-auto'
      : filtered.length === 2
      ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <>
      <SEOHead
        title="Harga & Paket — ViviDev.id"
        description="Pilih paket yang sesuai kebutuhan Anda. Mulai gratis atau upgrade kapan saja."
        canonical="/pricing"
      />

      {/* Hero */}
      <PricingHero />

      <section className="section-padding bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">

          {/* Category tab */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-200 dark:bg-gray-800 rounded-full p-1 gap-1">
              {(['individual', 'team'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {cat === 'individual'
                    ? 'Individual'
                    : lang === 'id' ? 'Tim & Enterprise' : 'Team & Enterprise'}
                </button>
              ))}
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-200 dark:bg-gray-800 rounded-full p-1 gap-1">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billing === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {lang === 'id' ? 'Bulanan' : 'Monthly'}
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billing === 'yearly'
                    ? 'bg-gray-900 dark:bg-gray-600 text-white shadow'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {lang === 'id' ? 'Tahunan' : 'Yearly'}
                <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded-full">
                  {lang === 'id' ? 'Hemat 17%' : 'Save 17%'}
                </span>
              </button>
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-20">
              {lang === 'id' ? 'Belum ada paket tersedia.' : 'No plans available yet.'}
            </p>
          ) : (
            <div className={`grid gap-8 ${colsClass}`}>
              {filtered.map(plan => {
                const price = formatPrice(plan);
                const yearlyTotal =
                  billing === 'yearly' && plan.priceYearly !== null && plan.priceYearly > 0
                    ? new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: plan.currency || 'IDR',
                        maximumFractionDigits: 0,
                      }).format(plan.priceYearly * 12)
                    : null;

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl p-8 border transition-shadow ${
                      plan.highlighted
                        ? 'bg-white dark:bg-gray-800 border-primary-500 shadow-xl scale-[1.02]'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                        {plan.badge}
                      </span>
                    )}

                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.label[lang] || plan.label.id}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {plan.subtitle[lang] || plan.subtitle.id}
                      </p>
                    </div>

                    <div className="mb-6">
                      {price === null ? (
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}
                        </p>
                      ) : (
                        <>
                          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                            {price}
                          </span>
                          {price !== 'Gratis' && (
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                              /{lang === 'id' ? 'bln' : 'mo'}
                            </span>
                          )}
                          {yearlyTotal && (
                            <p className="text-xs text-gray-400 mt-1">
                              {yearlyTotal} {lang === 'id' ? 'ditagih tahunan' : 'billed yearly'}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <a
                      href={plan.ctaUrl || '/contact'}
                      className={`w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-colors mb-8 ${
                        plan.highlighted
                          ? 'bg-gray-900 dark:bg-primary-600 text-white hover:bg-gray-700 dark:hover:bg-primary-700'
                          : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {plan.ctaLabel[lang] || plan.ctaLabel.id}
                    </a>

                    <ul className="space-y-3 flex-1">
                      {plan.features.map(f => (
                        <li key={f.id} className="flex items-start gap-3">
                          <Check
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              f.included
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-gray-300'
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              f.included
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-400 line-through'
                            }`}
                          >
                            {f.text[lang] || f.text.id}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-12">
            *{lang === 'id'
              ? 'Harga dapat berubah sewaktu-waktu. Hubungi kami untuk detail lebih lanjut.'
              : 'Prices may change at any time. Contact us for more details.'}
          </p>
        </div>
      </section>
    </>
  );
}

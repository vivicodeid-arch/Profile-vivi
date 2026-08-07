import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import ErrorAlert from '../components/ui/ErrorAlert';
import { useApi } from '../hooks/useApi';
import type { PricingPlan } from '../types';
import { SITE_NAME, SITE_URL } from '../lib/constants';

// Build ItemList schema dynamically from live plans
function buildPricingSchema(plans: PricingPlan[], lang: 'id' | 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'id' ? `Paket Harga — ${SITE_NAME}` : `Pricing Plans — ${SITE_NAME}`,
    url: `${SITE_URL}/pricing`,
    description: lang === 'id'
      ? 'Paket harga layanan web development ViviDev.id'
      : 'ViviDev.id web development pricing plans',
    numberOfItems: plans.length,
    itemListElement: plans.map((plan, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Offer',
        name: plan.label[lang] || plan.name,
        description: plan.subtitle?.[lang] ?? '',
        priceCurrency: plan.currency || 'IDR',
        price: plan.priceMonthly ?? 0,
        availability: plan.active
          ? 'https://schema.org/InStock'
          : 'https://schema.org/Discontinued',
        url: plan.ctaUrl ?? `${SITE_URL}/contact`,
      },
    })),
  };
}

export default function Pricing() {
  const { t, i18n } = useTranslation(['pages']);
  const lang = i18n.language as 'id' | 'en';

  const { data: plans, isLoading, error } = useApi<PricingPlan[]>('/pricing');

  // Group plans by category
  const grouped = plans
    ? plans.reduce<Record<string, PricingPlan[]>>((acc, plan) => {
        const cat = plan.category || 'default';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(plan);
        return acc;
      }, {})
    : {};

  const schema = plans ? buildPricingSchema(plans, lang) : undefined;

  return (
    <>
      <SEOHead
        title={t('pricing.meta.title')}
        description={t('pricing.meta.description')}
        canonical="/pricing"
        schema={schema}
      />

      <PageHero
        page="pricing"
        titleKey="pricing.hero.title"
        subtitleKey="pricing.hero.subtitle"
      />

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          {isLoading && <Spinner />}
          {error && <ErrorAlert message={error} />}

          {!isLoading && !error && Object.keys(grouped).length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-16">
              {t('pricing.empty')}
            </p>
          )}

          {Object.entries(grouped).map(([category, categoryPlans]) => (
            <div key={category} className="mb-16 last:mb-0">
              {Object.keys(grouped).length > 1 && (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 capitalize">
                  {category}
                </h2>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryPlans.map(plan => (
                  <PricingCard key={plan.id} plan={plan} lang={lang} />
                ))}
              </div>
            </div>
          ))}

          {plans && plans.length > 0 && (
            <p className="mt-12 text-center text-xs text-gray-400">
              * {lang === 'id'
                ? 'Harga dapat berubah sewaktu-waktu. Hubungi kami untuk detail lebih lanjut.'
                : 'Prices may change at any time. Contact us for more details.'}
            </p>
          )}
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface PricingCardProps {
  plan: PricingPlan;
  lang: 'id' | 'en';
}

function PricingCard({ plan, lang }: PricingCardProps) {
  const price = plan.priceMonthly;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 ${
        plan.highlighted
          ? 'border-primary-500 bg-primary-600 text-white shadow-xl scale-105'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold text-gray-900">
          {plan.badge}
        </span>
      )}

      <p className="text-sm font-semibold uppercase tracking-wide opacity-70 mb-1">
        {plan.label[lang] || plan.name}
      </p>
      <p className="text-sm opacity-60 mb-6">
        {plan.subtitle[lang]}
      </p>

      <div className="mb-6">
        {price !== null ? (
          <span className="text-4xl font-bold">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: plan.currency || 'IDR',
              maximumFractionDigits: 0,
            }).format(price)}
          </span>
        ) : (
          <span className="text-2xl font-bold">
            {lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}
          </span>
        )}
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.sort((a, b) => a.order - b.order).map(f => (
          <li key={f.id} className="flex items-start gap-2.5">
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                f.included
                  ? plan.highlighted ? 'text-white' : 'text-primary-600 dark:text-primary-400'
                  : 'opacity-30'
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-sm ${
                f.included ? '' : 'opacity-40 line-through'
              }`}
            >
              {f.text[lang] || f.text.id}
            </span>
          </li>
        ))}
      </ul>

      {plan.ctaUrl ? (
        <a
          href={plan.ctaUrl}
          className={`text-center rounded-xl px-6 py-3 text-sm font-semibold transition-colors ${
            plan.highlighted
              ? 'bg-white text-primary-700 hover:bg-primary-50'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {plan.ctaLabel[lang] || (lang === 'id' ? 'Mulai Sekarang' : 'Get Started')}
        </a>
      ) : (
        <a
          href="/contact"
          className={`text-center rounded-xl px-6 py-3 text-sm font-semibold transition-colors ${
            plan.highlighted
              ? 'bg-white text-primary-700 hover:bg-primary-50'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {plan.ctaLabel[lang] || (lang === 'id' ? 'Hubungi Kami' : 'Contact Us')}
        </a>
      )}
    </div>
  );
}

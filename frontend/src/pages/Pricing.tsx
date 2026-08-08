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

      <section className="section-padding bg-[#0f172a] text-white">
        <div className="container-custom">
          {isLoading && <Spinner />}
          {error && <ErrorAlert message={error} />}

          {!isLoading && !error && Object.keys(grouped).length === 0 && (
            <p className="text-center text-slate-400 py-16">
              {t('pricing.empty')}
            </p>
          )}

          {Object.entries(grouped).map(([category, categoryPlans]) => (
            <div key={category} className="mb-16 last:mb-0">
              {Object.keys(grouped).length > 1 && (
                <h2 className="text-3xl font-bold text-white mb-8 capitalize text-center">
                  {category}
                </h2>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-0 lg:[perspective:1200px] items-center max-w-6xl mx-auto">
                {categoryPlans.map((plan, index) => (
                  <PricingCard key={plan.id} plan={plan} lang={lang} index={index} />
                ))}
              </div>
            </div>
          ))}

          {plans && plans.length > 0 && (
            <p className="mt-12 text-center text-xs text-slate-400">
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
  index: number;
}

function PricingCard({ plan, lang, index }: PricingCardProps) {
  const price = plan.priceMonthly;
  const isLeft = index % 3 === 0;
  const isCenter = index % 3 === 1;
  const isRight = index % 3 === 2;
  const isHighlighted = plan.highlighted || isCenter;

  const originalPriceStr = price ? new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: plan.currency || 'IDR',
    maximumFractionDigits: 0,
  }).format(price * 1.2) : null;

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 transition-all duration-500 hover:z-20 
        bg-[#1e293b] border border-slate-700/50 
        ${isHighlighted 
          ? 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_10px_0_#020617] z-10 lg:scale-110 lg:-translate-y-4' 
          : 'shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5),0_8px_0_#020617] z-0 lg:scale-95 opacity-90 hover:opacity-100'}
        ${!isHighlighted && isLeft ? 'lg:[transform:rotateY(15deg)] lg:origin-right' : ''}
        ${!isHighlighted && isRight ? 'lg:[transform:rotateY(-15deg)] lg:origin-left' : ''}
      `}
    >
      {/* Dashed red top border for highlighted card */}
      {isHighlighted && (
        <div className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl overflow-hidden">
          <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, #ffffff 10px, #ffffff 20px)' }}></div>
        </div>
      )}

      {plan.badge && (
        <span
          className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-lg
            ${isHighlighted ? 'text-white shadow-red-800/40' : 'bg-slate-700 text-slate-200'}
          `}
          style={isHighlighted ? { backgroundColor: '#c81e1e' } : {}}
        >
          ★ {plan.badge}
        </span>
      )}

      <div className="mt-4">
        <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">{plan.category || 'Company Profile'}</span>
        <h3 className="text-2xl font-bold text-white mt-1">
          {plan.label[lang] || plan.label?.id || plan.name}
        </h3>
        <p className="text-xs mt-2 text-slate-400">
          {plan.subtitle[lang] || plan.subtitle?.id}
        </p>
      </div>

      <div className="mt-6">
        {price !== null ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-slate-400 line-through decoration-red-500">
                {originalPriceStr}
              </span>
              {isHighlighted && (
                <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#b91c1c' }}>POTONGAN SPESIAL</span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: plan.currency || 'IDR',
                  maximumFractionDigits: 0,
                }).format(price)}
              </span>
            </div>
            <span className="text-xs italic text-slate-400 mt-2">
              Gratis domain (.com) & hosting tahun pertama
            </span>
          </div>
        ) : (
          <span className="text-4xl font-bold text-white">
            —
          </span>
        )}
      </div>

      <hr className="border-slate-700 my-6" />

      <p className="text-sm text-slate-300 mb-4 h-10">
        {isHighlighted 
          ? (lang === 'id' ? "Untuk bisnis yang ingin kelola konten sendiri — panel admin, training, dan marketing digital terintegrasi." : "For businesses wanting to manage their own content — admin panel, training, and integrated digital marketing.") 
          : (lang === 'id' ? "Solusi lengkap untuk perusahaan besar yang membutuhkan website premium & performa tinggi." : "Complete solution for large enterprises needing premium websites & high performance.")}
      </p>

      <ul className="flex-1 space-y-3 mb-8">
        {plan.features.sort((a, b) => a.order - b.order).map(f => (
          <li key={f.id} className="flex items-start gap-3 text-sm">
            {f.included ? (
              <Check className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" aria-hidden="true" />
            ) : (
              <span className="w-5 h-5 shrink-0 text-red-500 flex items-center justify-center font-bold mt-0.5">✕</span>
            )}
            <span className={f.included ? 'text-slate-200' : 'text-slate-500 line-through'}>
              {f.text[lang] || f.text?.id}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={plan.ctaUrl || '/contact'}
        className={`mt-auto block text-center py-3 px-6 rounded-full text-sm font-bold transition-all duration-200 ${
          isHighlighted
            ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
            : 'bg-slate-700/50 text-white hover:bg-slate-700 border border-slate-600'
        }`}
      >
        {plan.ctaLabel[lang] || plan.ctaLabel?.id || (lang === 'id' ? 'Pilih Paket ini' : 'Choose this Plan')}
      </a>
    </div>
  );
}

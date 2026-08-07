import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight } from 'lucide-react';
import { useInView } from '../../hooks/useInView';
import type { PricingPlan } from '../../types';

interface PricingSectionProps {
  plans: PricingPlan[];
}

/**
 * Pricing preview section on the Home page — shows the first 3 plans.
 */
export default function PricingSection({ plans }: PricingSectionProps) {
  const { t, i18n } = useTranslation(['pages']);
  const lang = i18n.language as 'id' | 'en';
  const { ref, inView } = useInView(0.1);

  if (plans.length === 0) return null;

  return (
    <section
      ref={ref}
      className="section-padding bg-white dark:bg-gray-900"
      aria-labelledby="pricing-heading"
    >
      <div
        className="container-custom transition-all duration-700"
        style={{
          opacity:   inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        <h2 id="pricing-heading" className="section-title">
          {t('home.pricing.title')}
        </h2>
        <p className="section-subtitle">{t('home.pricing.subtitle')}</p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.slice(0, 3).map(plan => {
            const price    = plan.priceMonthly;
            const priceStr =
              price === null ? null
              : price === 0  ? t('home.pricing.free')
              : new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: plan.currency || 'IDR',
                  maximumFractionDigits: 0,
                }).format(price);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  plan.highlighted
                    ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/30'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.highlighted ? 'bg-white text-primary-600' : 'bg-primary-600 text-white'
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}

                <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.label[lang] || plan.label.id || plan.name}
                </h3>
                <p className={`text-sm mt-1 ${plan.highlighted ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {plan.subtitle[lang] || plan.subtitle.id}
                </p>

                <div className="mt-4">
                  {priceStr ? (
                    <>
                      <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {priceStr}
                      </span>
                      <span className={`text-sm ml-1 ${plan.highlighted ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {t('home.pricing.monthly')}
                      </span>
                    </>
                  ) : (
                    <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      —
                    </span>
                  )}
                </div>

                <ul className="mt-4 space-y-2">
                  {plan.features.slice(0, 4).map(f => (
                    <li key={f.id} className="flex items-center gap-2 text-sm">
                      <Check
                        className={`w-4 h-4 shrink-0 ${
                          f.included
                            ? plan.highlighted ? 'text-white' : 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        aria-hidden="true"
                      />
                      <span className={f.included ? (plan.highlighted ? 'text-white' : 'text-gray-700 dark:text-gray-300') : 'text-gray-400 line-through'}>
                        {f.text[lang] || f.text.id}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.ctaUrl || '/pricing'}
                  className={`mt-6 block text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                    plan.highlighted
                      ? 'bg-white text-primary-600 hover:bg-primary-50'
                      : 'bg-primary-600 text-white hover:bg-primary-500'
                  }`}
                >
                  {plan.ctaLabel[lang] || plan.ctaLabel.id || 'Pilih Paket'}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            {t('home.pricing.viewAll')}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

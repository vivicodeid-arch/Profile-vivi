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
  // Render a skeleton while plans are loading to prevent CLS (layout shift).
  // Returning null here would cause the section to pop in after the API call,
  // shifting all content below it down — a major CLS contributor.
  if (plans.length === 0) {
    return (
      <section className="section-padding bg-[#0f172a] text-white min-h-[1900px] md:min-h-[1200px] lg:min-h-[1000px]" aria-hidden="true">
        <div className="container-custom">
          <div className="text-center space-y-3 animate-pulse">
            <div className="h-8 w-48 bg-slate-700 rounded mx-auto" />
            <div className="h-4 w-72 bg-slate-800 rounded mx-auto" />
          </div>
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto animate-pulse">
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-2xl bg-slate-800 h-96" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="section-padding bg-[#0f172a] text-white min-h-[1900px] md:min-h-[1200px] lg:min-h-[1000px]"
      aria-labelledby="pricing-heading"
    >
      <div className="container-custom">
        <div
          className="transition-all duration-700 text-center"
          style={{
            opacity:   inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold">
            {t('home.pricing.title')}
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">{t('home.pricing.subtitle')}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-0 lg:[perspective:1200px] items-center max-w-6xl mx-auto">
          {plans.slice(0, 3).map((plan, index) => {
            const isCenter = index === 1;
            const isLeft = index === 0;
            const isRight = index === 2;
            
            const price    = plan.priceMonthly;
            const priceStr =
              price === null ? null
              : price === 0  ? t('home.pricing.free')
              : new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: plan.currency || 'IDR',
                  maximumFractionDigits: 0,
                }).format(price);

            // Based on the image, there's a discounted price look. We'll simulate it if highlighted.
            const originalPriceStr = price ? new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: plan.currency || 'IDR',
                  maximumFractionDigits: 0,
                }).format(price * 1.2) : null;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-8 transition-all duration-500 hover:z-20 
                  bg-[#1e293b] border border-slate-700/50 
                  ${isCenter ? 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_10px_0_#020617] z-10 lg:scale-110 lg:-translate-y-4' : 'shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5),0_8px_0_#020617] z-0 lg:scale-95 opacity-90 hover:opacity-100'}
                  ${isLeft ? 'lg:[transform:rotateY(15deg)] lg:origin-right' : ''}
                  ${isRight ? 'lg:[transform:rotateY(-15deg)] lg:origin-left' : ''}
                `}
              >
                {/* Dashed red top border for center card */}
                {isCenter && (
                  <div className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl overflow-hidden">
                    <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, #ffffff 10px, #ffffff 20px)' }}></div>
                  </div>
                )}

                {/* Badge */}
                {plan.badge && (
                  <span
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-lg
                      ${plan.highlighted ? 'text-white shadow-red-800/40' : 'bg-slate-700 text-slate-200'}
                    `}
                    style={plan.highlighted ? { backgroundColor: '#b91c1c' } : {}}
                  >
                    ★ {plan.badge}
                  </span>
                )}

                <div className="mt-4">
                  <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">Company Profile</span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {plan.label[lang] || plan.label.id || plan.name}
                  </h3>
                  <p className="text-xs mt-2 text-slate-400">
                    {plan.subtitle[lang] || plan.subtitle.id}
                  </p>
                </div>

                <div className="mt-6">
                  {priceStr ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-slate-400 line-through decoration-red-500">{originalPriceStr}</span>
                        {plan.highlighted && (
                           <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#b91c1c' }}>POTONGAN SPESIAL</span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                          {priceStr}
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
                  {plan.highlighted 
                    ? "Untuk bisnis yang ingin kelola konten sendiri — panel admin, training, dan marketing digital terintegrasi." 
                    : "Solusi lengkap untuk perusahaan besar yang membutuhkan website premium & performa tinggi."}
                </p>

                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.slice(0, 7).map(f => (
                    <li key={f.id} className="flex items-start gap-3 text-sm">
                      {f.included ? (
                        <Check className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" aria-hidden="true" />
                      ) : (
                        <span className="w-5 h-5 shrink-0 text-red-500 flex items-center justify-center font-bold mt-0.5">✕</span>
                      )}
                      <span className={f.included ? 'text-slate-200' : 'text-slate-500'}>
                        {f.text[lang] || f.text.id}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.ctaUrl || '/pricing'}
                  className={`mt-auto block text-center py-3 px-6 rounded-full text-sm font-bold transition-all duration-200 ${
                    isCenter
                      ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'bg-slate-700/50 text-white hover:bg-slate-700 border border-slate-600'
                  }`}
                >
                  {plan.ctaLabel[lang] || plan.ctaLabel.id || 'Pilih Paket ini'}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
          >
            {t('home.pricing.viewAll')}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

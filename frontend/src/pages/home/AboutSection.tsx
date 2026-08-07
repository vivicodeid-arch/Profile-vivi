import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useInView } from '../../hooks/useInView';

const DEFAULT_FEATURES = [
  'Website berkualitas',
  'Halaman profil lengkap',
  'Desain modern',
  'Responsif & SEO friendly',
  'Performa cepat',
  'Dukungan profesional',
];

/**
 * "Tentang Kami" section on the Home page.
 * All text is CMS-driven via settingsStore with inline defaults.
 */
export default function AboutSection() {
  const { settings } = useSettingsStore();
  const { ref, inView } = useInView(0.1);

  const features = [
    settings.aboutHomeFeature1 || DEFAULT_FEATURES[0],
    settings.aboutHomeFeature2 || DEFAULT_FEATURES[1],
    settings.aboutHomeFeature3 || DEFAULT_FEATURES[2],
    settings.aboutHomeFeature4 || DEFAULT_FEATURES[3],
    settings.aboutHomeFeature5 || DEFAULT_FEATURES[4],
    settings.aboutHomeFeature6 || DEFAULT_FEATURES[5],
  ];

  return (
    <section ref={ref} className="section-padding bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image — slide dari kiri */}
          <div
            className="relative order-2 lg:order-1 transition-all duration-700"
            style={{
              opacity:   inView ? 1 : 0,
              transform: inView ? 'translateX(0)' : 'translateX(-30px)',
            }}
          >
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-x-1/4 -translate-y-1/4" />
            <img
              src={settings.aboutHomeImage || '/hero-mockup.png'}
              alt="ViviDev Web Design Mockup"
              className="relative z-10 w-full h-auto object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
              loading="lazy"
            />
          </div>

          {/* Content — slide dari kanan */}
          <div
            className="order-1 lg:order-2 transition-all duration-700 delay-150"
            style={{
              opacity:   inView ? 1 : 0,
              transform: inView ? 'translateX(0)' : 'translateX(30px)',
            }}
          >
            <h3 className="text-primary-600 font-semibold text-lg mb-2">
              {settings.aboutHomeSubtitle || 'Tentang Kami'}
            </h3>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
              {settings.aboutHomeTitle || 'Bangun Kredibilitas Bisnis Lewat Website Profesional'}
            </h2>

            <div className="text-gray-600 dark:text-gray-300 space-y-4 mb-8 leading-relaxed">
              <p>
                {settings.aboutHomeDesc1 ||
                  'ViviDev adalah perusahaan yang bergerak di bidang jasa pembuatan website profesional untuk bisnis, UMKM, startup, dan perusahaan yang ingin berkembang di era digital.'}
              </p>
              <p>
                {settings.aboutHomeDesc2 ||
                  'Kami tidak hanya membuat website yang "terlihat bagus", kami membangun:'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {features.map(feature => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={3} aria-hidden="true" />
                  </div>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              to={settings.aboutHomeCtaUrl || '/portfolio'}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              {settings.aboutHomeCtaText || 'Lihat Portfolio'}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

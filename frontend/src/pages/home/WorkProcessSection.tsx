import { useInView } from '../../hooks/useInView';

export interface WorkProcessStep {
  id: number;
  title: string;
  description: string;
}

interface WorkProcessSectionProps {
  // In the future, this can be fetched from the admin API
  steps?: WorkProcessStep[];
}

const defaultSteps: WorkProcessStep[] = [
  {
    id: 1,
    title: 'Konsultasi Kebutuhan',
    description: 'Diskusi tujuan, target audiens, dan fitur yang dibutuhkan bisnis Anda.',
  },
  {
    id: 2,
    title: 'Pengumpulan Materi',
    description: 'Kumpulkan logo, konten, foto, dan informasi penting untuk website.',
  },
  {
    id: 3,
    title: 'Penyusunan Struktur',
    description: 'Susun sitemap dan struktur halaman agar rapi dan mudah dipahami.',
  },
  {
    id: 4,
    title: 'Desain & Development',
    description: 'Eksekusi desain modern dan pengembangan website yang cepat.',
  },
  {
    id: 5,
    title: 'Revisi & Testing',
    description: 'Cek tampilan, kecepatan, dan fungsi di berbagai perangkat.',
  },
  {
    id: 6,
    title: 'Website Online',
    description: 'Website siap digunakan, dipublikasikan, dan dipromosikan.',
  }
];

export default function WorkProcessSection({ steps = defaultSteps }: WorkProcessSectionProps) {
  const { ref, inView } = useInView(0.1);

  return (
    <section 
      ref={ref}
      className="section-padding bg-slate-50 dark:bg-slate-900"
    >
      <div className="container-custom">
        <div 
          className="text-center transition-opacity duration-700 mb-20"
          style={{
            opacity: inView ? 1 : 0,
          }}
        >
          <span className="text-primary-600 font-bold tracking-widest text-sm uppercase mb-4 block">
            [ PROSES KERJA ]
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
            Alur pembuatan website yang jelas dari awal sampai online
          </h2>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-6xl mx-auto mt-16">
          
          {/* Horizontal Line for Desktop */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>

          {/* Vertical Line for Mobile */}
          <div className="block lg:hidden absolute top-0 bottom-0 left-[1.9rem] w-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-6 relative z-10">
            {steps.map((step) => {
              return (
                <div key={step.id} className="relative flex lg:flex-col items-start lg:items-center">
                  
                  {/* Circle Number */}
                  <div className="w-16 h-16 shrink-0 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] border-4 border-slate-50 dark:border-slate-900 z-10 transition-transform duration-300 hover:[@media(hover:hover)]:scale-110">
                    {String(step.id).padStart(2, '0')}
                  </div>

                  {/* Content for Mobile (right of circle) & Desktop (below circle) */}
                  <div className="pl-6 lg:pl-0 lg:mt-8 lg:text-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

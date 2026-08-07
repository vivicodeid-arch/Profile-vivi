import { useTranslation } from 'react-i18next';
import { useInView, useCountUp } from '../../hooks/useInView';

// ---------------------------------------------------------------------------
// StatItem — animates a number from 0 to its target when scrolled into view
// ---------------------------------------------------------------------------

interface StatItemProps {
  value: string;
  label: string;
  inView: boolean;
}

function StatItem({ value, label, inView }: StatItemProps) {
  const isNumeric   = /^\d+/.test(value);
  const numericPart = isNumeric ? parseInt(value, 10) : 0;
  const suffix      = value.replace(/^\d+/, '');
  const count       = useCountUp(numericPart, inView);

  return (
    <div className="text-center group">
      <div className="text-4xl lg:text-5xl font-bold tabular-nums transition-all duration-300 group-hover:scale-110" style={{ color: '#0D47A1' }}>
        {isNumeric ? `${count}${suffix}` : value}
      </div>
      <div className="mt-2 text-sm font-medium" style={{ color: '#1565C0' }}>{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatsSection
// ---------------------------------------------------------------------------

export default function StatsSection() {
  const { t } = useTranslation(['pages']);
  const { ref, inView } = useInView(0.2);

  const stats = [
    { value: '50+',  label: t('home.stats.projects') },
    { value: '40+',  label: t('home.stats.clients')  },
    { value: '5+',   label: t('home.stats.years')    },
    { value: '24/7', label: t('home.stats.support')  },
  ];

  return (
    <section
      ref={ref}
      className="py-16 border-b border-blue-100"
      style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 50%, #E3F2FD 100%)' }}
      aria-label="Statistik"
    >
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="transition-all duration-700"
              style={{
                opacity:         inView ? 1 : 0,
                transform:       inView ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <StatItem value={s.value} label={s.label} inView={inView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

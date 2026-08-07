import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
}

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    api.get('/partners').then(r => setPartners(r.data.data || [])).catch(() => {});
  }, []);

  if (partners.length === 0) return null;

  // Duplicate for seamless infinite scroll
  const doubled = [...partners, ...partners];

  return (
    <section className="py-12 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="container-custom mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400">
          Dipercaya oleh
        </p>
      </div>

      {/* Marquee wrapper */}
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] dark:[mask-image:linear-gradient(to_right,transparent,#030712_10%,#030712_90%,transparent)]">
        <div className="flex animate-marquee gap-12 whitespace-nowrap">
          {doubled.map((partner, i) => (
            <PartnerLogo key={`${partner.id}-${i}`} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const content = (
    <div className="flex items-center justify-center h-10 w-36 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 shrink-0">
      <img
        src={partner.logoUrl}
        alt={partner.name}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
      />
    </div>
  );

  if (partner.websiteUrl) {
    return (
      <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" title={partner.name}>
        {content}
      </a>
    );
  }

  return <div title={partner.name}>{content}</div>;
}

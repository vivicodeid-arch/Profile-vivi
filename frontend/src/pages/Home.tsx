import { SEOHead } from '../components/seo/SEOHead';
import PartnersSection from '../components/ui/PartnersSection';
import HeroSection from './home/HeroSection';
import StatsSection from './home/StatsSection';
import AboutSection from './home/AboutSection';
import ServicesSection from './home/ServicesSection';
import PricingSection from './home/PricingSection';
import WorkProcessSection from './home/WorkProcessSection';
import CtaSection from './home/CtaSection';
import { useApi } from '../hooks/useApi';
import type { Service, PricingPlan } from '../types';
import { SITE_NAME, SITE_URL } from '../lib/constants';

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Jasa web developer profesional — website modern, cepat, dan SEO-friendly.',
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+62-857-9811-2370',
      contactType: 'customer service',
    },
  },
};

export default function Home() {
  const { data: services } = useApi<Service[]>('/services');
  const { data: plans }    = useApi<PricingPlan[]>('/pricing');

  return (
    <>
      <SEOHead
        title="ViviDev.id — Jasa Web Developer Profesional"
        description="ViviDev.id menyediakan jasa pembuatan website profesional, aplikasi web, dan optimasi SEO untuk bisnis Anda."
        canonical="/"
        schema={orgSchema}
      />

      <HeroSection />
      <StatsSection />
      <ServicesSection services={services ?? []} />
      <AboutSection />
      <PricingSection plans={plans ?? []} />
      <WorkProcessSection />
      <PartnersSection />
      <CtaSection />
    </>
  );
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const passwordHash = await bcrypt.hash('Admin@Vividev2026!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@vividev.id' },
    update: {},
    create: {
      email: 'admin@vividev.id',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Services
  const services = [
    {
      title: { id: 'Pembuatan Website', en: 'Website Development' },
      description: {
        id: 'Kami membangun website profesional yang modern, cepat, dan responsif sesuai kebutuhan bisnis Anda.',
        en: 'We build modern, fast, and responsive professional websites tailored to your business needs.',
      },
      icon: 'globe',
      order: 1,
    },
    {
      title: { id: 'Aplikasi Web', en: 'Web Application' },
      description: {
        id: 'Pengembangan aplikasi web full-stack yang scalable menggunakan teknologi terkini.',
        en: 'Scalable full-stack web application development using the latest technologies.',
      },
      icon: 'code',
      order: 2,
    },
    {
      title: { id: 'UI/UX Design', en: 'UI/UX Design' },
      description: {
        id: 'Desain antarmuka yang intuitif dan menarik untuk meningkatkan pengalaman pengguna.',
        en: 'Intuitive and attractive interface design to enhance user experience.',
      },
      icon: 'palette',
      order: 3,
    },
    {
      title: { id: 'Optimasi SEO', en: 'SEO Optimization' },
      description: {
        id: 'Tingkatkan visibilitas website Anda di mesin pencari dengan strategi SEO yang terukur.',
        en: 'Boost your website visibility on search engines with measurable SEO strategies.',
      },
      icon: 'search',
      order: 4,
    },
    {
      title: { id: 'Maintenance & Support', en: 'Maintenance & Support' },
      description: {
        id: 'Layanan pemeliharaan dan dukungan teknis untuk menjaga website Anda tetap optimal.',
        en: 'Maintenance and technical support services to keep your website running optimally.',
      },
      icon: 'wrench',
      order: 5,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: `seed-service-${service.order}` },
      update: {},
      create: { id: `seed-service-${service.order}`, ...service },
    });
  }

  // Team members
  const team = [
    {
      name: 'ViviDev Team',
      role: { id: 'Founder & Lead Developer', en: 'Founder & Lead Developer' },
      bio: {
        id: 'Berpengalaman lebih dari 5 tahun dalam pengembangan web modern.',
        en: 'With more than 5 years of experience in modern web development.',
      },
      order: 1,
    },
  ];

  for (const member of team) {
    await prisma.teamMember.upsert({
      where: { id: `seed-team-${member.order}` },
      update: {},
      create: { id: `seed-team-${member.order}`, ...member },
    });
  }

  // Pricing Plans
  const pricingPlans = [
    {
      id: 'seed-plan-1',
      name: 'Starter',
      label: { id: 'Starter', en: 'Starter' },
      subtitle: { id: 'Cocok untuk personal & UMKM', en: 'Perfect for personal & small business' },
      category: 'individual',
      priceMonthly: 1500000,
      priceYearly: 15000000,
      currency: 'IDR',
      highlighted: false,
      badge: null,
      ctaLabel: { id: 'Mulai Sekarang', en: 'Get Started' },
      ctaUrl: '/contact',
      active: true,
      order: 1,
      features: [
        { id: 'seed-f-1-1', text: { id: 'Website 5 halaman', en: '5-page website' }, included: true, order: 1 },
        { id: 'seed-f-1-2', text: { id: 'Desain responsif (mobile-friendly)', en: 'Responsive design (mobile-friendly)' }, included: true, order: 2 },
        { id: 'seed-f-1-3', text: { id: 'SEO dasar', en: 'Basic SEO' }, included: true, order: 3 },
        { id: 'seed-f-1-4', text: { id: 'Form kontak', en: 'Contact form' }, included: true, order: 4 },
        { id: 'seed-f-1-5', text: { id: 'SSL gratis', en: 'Free SSL' }, included: true, order: 5 },
        { id: 'seed-f-1-6', text: { id: 'Revisi 2x', en: '2 revisions' }, included: true, order: 6 },
        { id: 'seed-f-1-7', text: { id: 'Dukungan 30 hari', en: '30-day support' }, included: true, order: 7 },
        { id: 'seed-f-1-8', text: { id: 'Custom domain', en: 'Custom domain' }, included: false, order: 8 },
        { id: 'seed-f-1-9', text: { id: 'CMS / Admin panel', en: 'CMS / Admin panel' }, included: false, order: 9 },
        { id: 'seed-f-1-10', text: { id: 'Integrasi e-commerce', en: 'E-commerce integration' }, included: false, order: 10 },
      ],
    },
    {
      id: 'seed-plan-2',
      name: 'Professional',
      label: { id: 'Professional', en: 'Professional' },
      subtitle: { id: 'Untuk bisnis yang ingin berkembang', en: 'For growing businesses' },
      category: 'individual',
      priceMonthly: 3500000,
      priceYearly: 35000000,
      currency: 'IDR',
      highlighted: true,
      badge: 'Populer',
      ctaLabel: { id: 'Pilih Paket Ini', en: 'Choose This Plan' },
      ctaUrl: '/contact',
      active: true,
      order: 2,
      features: [
        { id: 'seed-f-2-1', text: { id: 'Website hingga 15 halaman', en: 'Up to 15-page website' }, included: true, order: 1 },
        { id: 'seed-f-2-2', text: { id: 'Desain responsif (mobile-friendly)', en: 'Responsive design (mobile-friendly)' }, included: true, order: 2 },
        { id: 'seed-f-2-3', text: { id: 'SEO lanjutan + Google Analytics', en: 'Advanced SEO + Google Analytics' }, included: true, order: 3 },
        { id: 'seed-f-2-4', text: { id: 'Form kontak & WhatsApp integration', en: 'Contact form & WhatsApp integration' }, included: true, order: 4 },
        { id: 'seed-f-2-5', text: { id: 'SSL gratis', en: 'Free SSL' }, included: true, order: 5 },
        { id: 'seed-f-2-6', text: { id: 'Custom domain', en: 'Custom domain' }, included: true, order: 6 },
        { id: 'seed-f-2-7', text: { id: 'CMS / Admin panel', en: 'CMS / Admin panel' }, included: true, order: 7 },
        { id: 'seed-f-2-8', text: { id: 'Revisi 5x', en: '5 revisions' }, included: true, order: 8 },
        { id: 'seed-f-2-9', text: { id: 'Dukungan 90 hari', en: '90-day support' }, included: true, order: 9 },
        { id: 'seed-f-2-10', text: { id: 'Integrasi e-commerce', en: 'E-commerce integration' }, included: false, order: 10 },
      ],
    },
    {
      id: 'seed-plan-3',
      name: 'Business',
      label: { id: 'Business', en: 'Business' },
      subtitle: { id: 'Solusi lengkap untuk bisnis serius', en: 'Complete solution for serious business' },
      category: 'individual',
      priceMonthly: 7500000,
      priceYearly: 75000000,
      currency: 'IDR',
      highlighted: false,
      badge: null,
      ctaLabel: { id: 'Hubungi Kami', en: 'Contact Us' },
      ctaUrl: '/contact',
      active: true,
      order: 3,
      features: [
        { id: 'seed-f-3-1', text: { id: 'Website tak terbatas halaman', en: 'Unlimited pages' }, included: true, order: 1 },
        { id: 'seed-f-3-2', text: { id: 'Desain custom premium', en: 'Premium custom design' }, included: true, order: 2 },
        { id: 'seed-f-3-3', text: { id: 'SEO enterprise + strategi konten', en: 'Enterprise SEO + content strategy' }, included: true, order: 3 },
        { id: 'seed-f-3-4', text: { id: 'Integrasi e-commerce penuh', en: 'Full e-commerce integration' }, included: true, order: 4 },
        { id: 'seed-f-3-5', text: { id: 'CMS / Admin panel advanced', en: 'Advanced CMS / Admin panel' }, included: true, order: 5 },
        { id: 'seed-f-3-6', text: { id: 'Custom domain & hosting premium', en: 'Custom domain & premium hosting' }, included: true, order: 6 },
        { id: 'seed-f-3-7', text: { id: 'Revisi unlimited', en: 'Unlimited revisions' }, included: true, order: 7 },
        { id: 'seed-f-3-8', text: { id: 'Dukungan 1 tahun', en: '1-year support' }, included: true, order: 8 },
        { id: 'seed-f-3-9', text: { id: 'Laporan analytics bulanan', en: 'Monthly analytics report' }, included: true, order: 9 },
        { id: 'seed-f-3-10', text: { id: 'Prioritas penanganan', en: 'Priority handling' }, included: true, order: 10 },
      ],
    },
    {
      id: 'seed-plan-4',
      name: 'Enterprise',
      label: { id: 'Enterprise', en: 'Enterprise' },
      subtitle: { id: 'Untuk perusahaan skala besar', en: 'For large-scale companies' },
      category: 'team',
      priceMonthly: null,
      priceYearly: null,
      currency: 'IDR',
      highlighted: false,
      badge: 'Custom',
      ctaLabel: { id: 'Diskusi Kebutuhan', en: 'Discuss Needs' },
      ctaUrl: '/contact',
      active: true,
      order: 4,
      features: [
        { id: 'seed-f-4-1', text: { id: 'Semua fitur Business', en: 'All Business features' }, included: true, order: 1 },
        { id: 'seed-f-4-2', text: { id: 'Arsitektur custom & skalabel', en: 'Custom & scalable architecture' }, included: true, order: 2 },
        { id: 'seed-f-4-3', text: { id: 'Integrasi API pihak ketiga', en: 'Third-party API integration' }, included: true, order: 3 },
        { id: 'seed-f-4-4', text: { id: 'Multi-bahasa & multi-region', en: 'Multi-language & multi-region' }, included: true, order: 4 },
        { id: 'seed-f-4-5', text: { id: 'SLA & uptime guarantee', en: 'SLA & uptime guarantee' }, included: true, order: 5 },
        { id: 'seed-f-4-6', text: { id: 'Dedicated project manager', en: 'Dedicated project manager' }, included: true, order: 6 },
        { id: 'seed-f-4-7', text: { id: 'Tim developer dedicated', en: 'Dedicated developer team' }, included: true, order: 7 },
        { id: 'seed-f-4-8', text: { id: 'Dukungan 24/7', en: '24/7 support' }, included: true, order: 8 },
        { id: 'seed-f-4-9', text: { id: 'Training & onboarding tim', en: 'Team training & onboarding' }, included: true, order: 9 },
        { id: 'seed-f-4-10', text: { id: 'Harga sesuai kebutuhan', en: 'Custom pricing' }, included: true, order: 10 },
      ],
    },
  ];

  for (const plan of pricingPlans) {
    const { features, ...planData } = plan;
    await prisma.pricingPlan.upsert({
      where: { id: plan.id },
      update: {},
      create: {
        ...planData,
        features: {
          create: features,
        },
      },
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

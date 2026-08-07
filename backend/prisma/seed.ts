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

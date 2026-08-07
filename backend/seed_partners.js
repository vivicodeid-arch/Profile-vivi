const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const partners = [
  { name: 'Client 1', logoUrl: '/uploads/partners/client1.webp', order: 1 },
  { name: 'Client 2', logoUrl: '/uploads/partners/client2.webp', order: 2 },
  { name: 'Client 3', logoUrl: '/uploads/partners/client3.webp', order: 3 },
  { name: 'Client 4', logoUrl: '/uploads/partners/client4.webp', order: 4 },
  { name: 'Client 5', logoUrl: '/uploads/partners/client5.webp', order: 5 },
  { name: 'Client 6', logoUrl: '/uploads/partners/client6.webp', order: 6 },
  { name: 'Client 8', logoUrl: '/uploads/partners/client8.webp', order: 7 },
  { name: 'Client 9', logoUrl: '/uploads/partners/client9.webp', order: 8 },
  { name: 'Client 10', logoUrl: '/uploads/partners/client10.webp', order: 9 },
  { name: 'BLG', logoUrl: '/uploads/partners/blg.webp', order: 10 },
  { name: 'GBM', logoUrl: '/uploads/partners/gbm.webp', order: 11 },
  { name: 'ADI', logoUrl: '/uploads/partners/adi.webp', order: 12 },
  { name: 'Partner', logoUrl: '/uploads/partners/logo-black-1.webp', order: 13 },
  { name: 'Partner 2', logoUrl: '/uploads/partners/logo-black.webp', order: 14 },
  { name: 'Partner 3', logoUrl: '/uploads/partners/logo-scaled.webp', order: 15 },
  { name: 'Sesi', logoUrl: '/uploads/partners/sesi.webp', order: 16 },
  { name: 'Sep 2025', logoUrl: '/uploads/partners/sep2025.webp', order: 17 },
  { name: 'ChatGPT', logoUrl: '/uploads/partners/chatgpt-logo.webp', order: 18 },
];

async function main() {
  for (const p of partners) {
    await prisma.partner.upsert({
      where: { id: p.name },
      update: {},
      create: { ...p, active: true },
    });
  }
  console.log(`Seeded ${partners.length} partners`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const flagship = await prisma.tenant.findUnique({
    where: { slug: 'flagship' }
  });

  if (flagship) {
    await prisma.tenant.update({
      where: { slug: 'flagship' },
      data: {
        slug: 'products',
        name: 'Kookies Products'
      }
    });
    console.log('Renamed flagship to Kookies Products!');
  } else {
    // If it was already renamed or doesn't exist
    const products = await prisma.tenant.findUnique({
      where: { slug: 'products' }
    });
    if (products) {
      console.log('Tenant "products" already exists.');
    } else {
      console.log('Could not find flagship tenant.');
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

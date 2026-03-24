import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { name: 'Classic White Tee', price: 29.99, description: 'Timeless premium cotton t-shirt, relaxed fit. Perfect for everyday wear.' },
  { name: 'Slim Cargo Pants', price: 74.99, description: 'Modern slim-fit cargo trousers in soft twill fabric with side pockets.' },
  { name: 'Oversized Hoodie', price: 89.99, description: 'Ultra-soft fleece oversized hoodie with kangaroo pocket. A wardrobe staple.' },
  { name: 'Linen Shirt', price: 54.99, description: 'Breathable summer linen shirt in a relaxed boxy silhouette.' },
  { name: 'Denim Jacket', price: 119.99, description: 'Vintage-wash denim jacket with structured shoulders and silver logo buttons.' },
  { name: 'Tapered Joggers', price: 64.99, description: 'Premium tapered joggers with elastic waistband and ribbed cuffs.' },
  { name: 'Graphic Crewneck', price: 79.99, description: 'Limited-edition graphic crewneck printed in-house at our studio.' },
  { name: 'Utility Vest', price: 94.99, description: 'Multi-pocket utility vest in water-resistant ripstop nylon.' },
  { name: 'Wide Leg Trousers', price: 69.99, description: 'Elegant wide-leg trousers in a fluid crepe fabric, high-waisted.' },
  { name: 'Track Jacket', price: 109.99, description: 'Retro-inspired track jacket with contrast side stripes and zip closure.' },
  { name: 'Boxy Crop Tee', price: 34.99, description: 'Ultra-cropped boxy fit tee in organic stretch jersey.' },
  { name: 'Bucket Hat', price: 39.99, description: 'Structured bucket hat with tonal embroidered logo on front panel.' },
];

async function main() {
  // Ensure seed tenant exists
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'kookies' },
    update: {},
    create: { name: 'Kookies Ventures', slug: 'kookies' }
  });

  console.log('Tenant:', tenant.name);

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name, tenantId: tenant.id }
    });
    
    if (!existing) {
      await prisma.product.create({
        data: { ...product, tenantId: tenant.id }
      });
      console.log('Created:', product.name);
    } else {
      console.log('Skipped (exists):', product.name);
    }
  }

  console.log('Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());

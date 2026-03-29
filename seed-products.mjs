import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Home Textile Products with real Unsplash images
const products = [
  // Duvets & Comforters
  {
    name: 'Premium Cotton Duvet Set',
    price: 149.99,
    description: 'Luxurious 100% Egyptian cotton duvet cover set with matching pillowcases. 400 thread count for ultimate comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    category: 'Bedding'
  },
  {
    name: 'Lightweight Summer Duvet',
    price: 89.99,
    description: 'Breathable microfiber duvet perfect for warm nights. Machine washable and hypoallergenic.',
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    category: 'Bedding'
  },
  {
    name: 'Reversible Duvet Cover',
    price: 119.99,
    description: 'Two-in-one reversible design. Premium cotton blend with elegant stripe pattern.',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    category: 'Bedding'
  },
  // Curtains
  {
    name: 'Blackout Velvet Curtains',
    price: 79.99,
    description: 'Premium velvet blackout curtains. Complete light blocking and thermal insulation.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
    category: 'Curtains'
  },
  {
    name: 'Sheer Linen Voile Curtains',
    price: 59.99,
    description: 'Elegant sheer linen curtains. Natural, breathable fabric for a soft, airy feel.',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    category: 'Curtains'
  },
  {
    name: 'Thermal Insulated Curtains',
    price: 99.99,
    description: 'Energy-efficient thermal curtains. Keeps rooms cool in summer and warm in winter.',
    imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80',
    category: 'Curtains'
  },
  // Bedsheets
  {
    name: 'Egyptian Cotton Sheets',
    price: 129.99,
    description: 'Extra soft Egyptian cotton sheets. 500 thread count with deep pockets for thick mattresses.',
    imageUrl: 'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=800&q=80',
    category: 'Bedding'
  },
  {
    name: 'Printed Flannel Sheets',
    price: 69.99,
    description: 'Cozy flannel sheets perfect for cold nights. Brushed for extra softness.',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
    category: 'Bedding'
  },
  {
    name: 'Sateen Stripe Sheets',
    price: 99.99,
    description: 'Luxurious sateen weave with classic stripe pattern. Silky smooth finish.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    category: 'Bedding'
  },
  // Pillowcases
  {
    name: 'Silk Pillowcase Set',
    price: 49.99,
    description: 'Pure mulberry silk pillowcases. Gentle on hair and skin. Includes 2 pillowcases.',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
    category: 'Bedding'
  },
  {
    name: 'Memory Foam Pillow',
    price: 79.99,
    description: 'Ergonomic memory foam pillow. Proper neck support for a restful sleep.',
    imageUrl: 'https://images.unsplash.com/photo-1592789705501-f9ae4278a9c9?w=800&q=80',
    category: 'Bedding'
  },
  {
    name: 'Decorative Pillow Set',
    price: 39.99,
    description: 'Set of 3 decorative throw pillows. Removable covers with hidden zippers.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    category: 'Decor'
  },
];

// Categories with images
const categories = [
  {
    name: 'Bedding',
    slug: 'bedding',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    description: 'Premium duvets, bedsheets, and pillowcases for a luxurious sleep experience'
  },
  {
    name: 'Curtains',
    slug: 'curtains',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
    description: 'Elegant curtains for every room - blackout, sheer, and thermal options'
  },
  {
    name: 'Decor',
    slug: 'decor',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    description: 'Decorative pillows and accessories to transform your space'
  },
  {
    name: 'Kitchen',
    slug: 'kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    description: 'Table linens, kitchen textiles, and cooking essentials'
  },
];

async function main() {
  // Ensure seed tenant exists
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'kookies' },
    update: {},
    create: {
      name: 'Kookies Ventures',
      slug: 'kookies',
      logoUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'
    }
  });

  console.log('Tenant:', tenant.name);

  // Create categories
  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { slug: cat.slug, tenantId: tenant.id }
    });

    if (!existing) {
      await prisma.category.create({
        data: { ...cat, tenantId: tenant.id }
      });
      console.log('Created category:', cat.name);
    } else {
      // Update existing category with image
      await prisma.category.update({
        where: { id: existing.id },
        data: { imageUrl: cat.imageUrl, description: cat.description }
      });
      console.log('Updated category:', cat.name);
    }
  }

  // Get categories for product assignment
  const categoryMap = {};
  for (const cat of categories) {
    const dbCat = await prisma.category.findFirst({
      where: { slug: cat.slug, tenantId: tenant.id }
    });
    if (dbCat) {
      categoryMap[cat.name] = dbCat.id;
    }
  }

  // Create products
  for (const product of products) {
    const { category, ...productData } = product;
    const existing = await prisma.product.findFirst({
      where: { name: product.name, tenantId: tenant.id }
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          tenantId: tenant.id,
          categoryId: categoryMap[category] || null,
          stock: Math.floor(Math.random() * 50) + 10
        }
      });
      console.log('Created product:', product.name);
    } else {
      // Update existing product with image
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          imageUrl: product.imageUrl,
          categoryId: categoryMap[category] || existing.categoryId
        }
      });
      console.log('Updated product:', product.name);
    }
  }

  console.log('Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());

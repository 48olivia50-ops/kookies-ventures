import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@kookies.com' },
    update: {},
    create: {
      email: 'admin@kookies.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'ADMIN'
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@kookies.com' },
    update: {},
    create: {
      email: 'customer@kookies.com',
      password: customerPassword,
      name: 'Test Customer',
      role: 'CUSTOMER'
    }
  });

  console.log('Created Admin:', admin.email);
  console.log('Created Customer:', customer.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());

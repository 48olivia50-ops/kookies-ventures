import React from 'react';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CheckoutClient from './CheckoutClient';
import { CartProvider } from '@/components/CartContext';
import Image from 'next/image';
import { CustomerHeader } from '@/components/CustomerHeader';
import Link from 'next/link';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ tenant?: string }> }) {
  const { tenant: tenantSlug = 'kookies' } = await searchParams;
  const session = await verifySession();
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });

  return (
    <CartProvider>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)' }}>
        <CustomerHeader store={tenant || { name: 'Kookies Ventures' }} session={session} tenantSlug={tenantSlug} />
        <CheckoutClient tenantSlug={tenantSlug} isAuth={!!session?.isAuth} />
      </div>
    </CartProvider>
  );
}

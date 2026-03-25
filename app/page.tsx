import React from 'react';
import styles from './store.module.css';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { AddToCartBtn, CartButton } from '@/components/CartUI';
import { verifySession } from '@/lib/auth';
import { logout } from '@/app/actions/auth';
import Image from 'next/image';
import { CurrencySelector } from '@/components/CurrencySelector';
import { PriceDisplay } from '@/components/PriceDisplay';
import Link from 'next/link';
import { CustomerHeader } from '@/components/CustomerHeader';
import { HeroSlider } from '@/components/HeroSlider';
import { ProductSlider } from '@/components/ProductSlider';

const productPatterns = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

export default async function Home() {
  const session = await verifySession();
  const slug = 'kookies';

  const store = await prisma.tenant.findUnique({
    where: { slug }
  });

  if (!store) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Welcome to Kookies Ventures</h1>
        <p>Site is being prepared. Please check back soon!</p>
        <Link href="/login">Admin Login</Link>
      </div>
    );
  }

  const [categories, uncategorizedProducts, totalProductsCount] = await Promise.all([
    (prisma as any).category.findMany({
      where: { tenantId: store.id },
      include: { products: { orderBy: { createdAt: 'desc' } } }
    }),
    (prisma as any).product.findMany({
      where: { tenantId: store.id, categoryId: null },
      orderBy: { createdAt: 'desc' }
    }),
    (prisma as any).product.count({ where: { tenantId: store.id } })
  ]);

  return (
    <div className={styles.storeContainer}>
      <CustomerHeader store={store} session={session} tenantSlug={slug} />

      <main className={styles.main}>
        <div className={styles.pageContent}>
          <div className={styles.hero}>
            <div className={styles.heroInner}>
              <span className={styles.heroPill}>🏷️ New Collection</span>
              <h1>{store.name}</h1>
              <p>Premium lifestyle essentials. {totalProductsCount} exclusive pieces available now.</p>
            </div>
            <div className={styles.heroSlider}>
              <HeroSlider />
            </div>
          </div>

          {!session?.isAuth && (
            <div className={styles.guestBanner}>
              <span>👋 Browsing as guest. <Link href="/login" className={styles.guestLink}>Log in</Link> to add items to your cart.</span>
            </div>
          )}

          {categories.map((category: any) => category.products.length > 0 && (
            <ProductSlider 
              key={category.id}
              products={category.products} 
              isAuth={!!session?.isAuth} 
              title={category.name}
              subtitle={`Explore our latest ${category.name.toLowerCase()}`}
            />
          ))}

          {uncategorizedProducts.length > 0 && (
            <div style={categories.length > 0 ? { marginTop: '2rem' } : {}}>
              <ProductSlider 
                products={uncategorizedProducts} 
                isAuth={!!session?.isAuth} 
                title="More Products"
                subtitle="Other items you might love"
              />
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}

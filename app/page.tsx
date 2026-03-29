import React from 'react';
import styles from './store.module.css';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import Link from 'next/link';
import { CustomerHeader } from '@/components/CustomerHeader';
import { ProductSlider } from '@/components/ProductSlider';

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

  // Get featured products (first 4 products across all categories)
  const featuredProducts = categories
    .flatMap((cat: any) => cat.products)
    .slice(0, 4);

  return (
    <div className={styles.storeContainer}>
      <CustomerHeader store={store} session={session} tenantSlug={slug} />

      <main className={styles.main}>
        <div className={styles.pageContent}>
          {/* Hero Section - Modern Ecommerce Design */}
          <section className={styles.hero}>
            <div className={styles.heroDecoration}>
              <div className={styles.floatingCircle}></div>
              <div className={styles.floatingCircle}></div>
              <div className={styles.floatingCircle}></div>
            </div>

            <div className={styles.heroInner}>
              <div className={styles.heroContent}>
                <span className={styles.heroPill}>✨ New Collection 2024</span>
                <h1>{store.name}</h1>
                <p>Discover premium lifestyle essentials crafted for the modern connoisseur. Curated collections that define elegance.</p>

                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{totalProductsCount}+</span>
                    <span className={styles.statLabel}>Products</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{categories.length}</span>
                    <span className={styles.statLabel}>Categories</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>5★</span>
                    <span className={styles.statLabel}>Quality</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroImageGrid}>
                {featuredProducts.map((product: any, index: number) => (
                  <div key={product.id} className={styles.heroImageCard}>
                    <span className={styles.heroImageEmoji}>{product.emoji || '🛍️'}</span>
                    <span className={styles.heroImageLabel}>{product.name}</span>
                  </div>
                ))}
                {featuredProducts.length === 0 && (
                  <>
                    <div className={styles.heroImageCard}>
                      <span className={styles.heroImageEmoji}>👗</span>
                      <span className={styles.heroImageLabel}>Fashion</span>
                    </div>
                    <div className={styles.heroImageCard}>
                      <span className={styles.heroImageEmoji}>💄</span>
                      <span className={styles.heroImageLabel}>Beauty</span>
                    </div>
                    <div className={styles.heroImageCard}>
                      <span className={styles.heroImageEmoji}>🎒</span>
                      <span className={styles.heroImageLabel}>Accessories</span>
                    </div>
                    <div className={styles.heroImageCard}>
                      <span className={styles.heroImageEmoji}>💡</span>
                      <span className={styles.heroImageLabel}>Lifestyle</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className={styles.quickLinks}>
            <Link href="/category/fashion" className={styles.quickLinkCard}>
              <span className={styles.quickLinkIcon}>👗</span>
              <span className={styles.quickLinkTitle}>Fashion</span>
              <span className={styles.quickLinkDesc}>Latest trends</span>
            </Link>
            <Link href="/category/beauty" className={styles.quickLinkCard}>
              <span className={styles.quickLinkIcon}>💄</span>
              <span className={styles.quickLinkTitle}>Beauty</span>
              <span className={styles.quickLinkDesc}>Skincare & more</span>
            </Link>
            <Link href="/category/accessories" className={styles.quickLinkCard}>
              <span className={styles.quickLinkIcon}>🎒</span>
              <span className={styles.quickLinkTitle}>Accessories</span>
              <span className={styles.quickLinkDesc}>Complete your look</span>
            </Link>
            <Link href="/category/lifestyle" className={styles.quickLinkCard}>
              <span className={styles.quickLinkIcon}>💡</span>
              <span className={styles.quickLinkTitle}>Lifestyle</span>
              <span className={styles.quickLinkDesc}>Home & living</span>
            </Link>
          </section>

          {/* Guest Banner */}
          {!session?.isAuth && (
            <div className={styles.guestBanner}>
              <span className={styles.guestBannerText}>
                👋 Browsing as guest. Create an account to save your favorites and track orders!
              </span>
              <Link href="/login" className={styles.guestLink}>
                Sign In / Register
              </Link>
            </div>
          )}

          {/* Category Product Sliders */}
          {categories.map((category: any) => category.products.length > 0 && (
            <ProductSlider
              key={category.id}
              products={category.products}
              isAuth={!!session?.isAuth}
              title={category.name}
              subtitle={`Explore our latest ${category.name.toLowerCase()} collection`}
              viewAllLink={`/category/${category.slug}`}
            />
          ))}

          {/* Uncategorized Products */}
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
        <p>© {new Date().getFullYear()} {store.name}. All rights reserved. | <Link href="/login">Admin</Link></p>
      </footer>
    </div>
  );
}

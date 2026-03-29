import React from 'react';
import styles from './store.module.css';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { CustomerHeader } from '@/components/CustomerHeader';
import { ProductSlider } from '@/components/ProductSlider';
import LogoSvg from '../../public/logo.svg';

// Static category images for home textiles
const categoryImages: Record<string, string> = {
  bedding: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
  curtains: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
  decor: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
};

const defaultCategoryImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80';

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
                <p>Discover premium home textiles crafted for comfort and style. Transform your living spaces with our curated collection.</p>

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
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product: any, index: number) => (
                    <div key={product.id} className={styles.heroImageCard}>
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={200}
                          height={150}
                          className={styles.heroImage}
                        />
                      ) : (
                        <div className={styles.heroImagePlaceholder}>
                          <Image
                            src={defaultCategoryImage}
                            alt={product.name}
                            width={200}
                            height={150}
                            className={styles.heroImage}
                          />
                        </div>
                      )}
                      <span className={styles.heroImageLabel}>{product.name}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className={styles.heroImageCard}>
                      <Image
                        src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80"
                        alt="Bedding"
                        width={200}
                        height={150}
                        className={styles.heroImage}
                      />
                      <span className={styles.heroImageLabel}>Bedding</span>
                    </div>
                    <div className={styles.heroImageCard}>
                      <Image
                        src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80"
                        alt="Curtains"
                        width={200}
                        height={150}
                        className={styles.heroImage}
                      />
                      <span className={styles.heroImageLabel}>Curtains</span>
                    </div>
                    <div className={styles.heroImageCard}>
                      <Image
                        src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80"
                        alt="Decor"
                        width={200}
                        height={150}
                        className={styles.heroImage}
                      />
                      <span className={styles.heroImageLabel}>Decor</span>
                    </div>
                    <div className={styles.heroImageCard}>
                      <Image
                        src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"
                        alt="Kitchen"
                        width={200}
                        height={150}
                        className={styles.heroImage}
                      />
                      <span className={styles.heroImageLabel}>Kitchen</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Quick Links - Categories with Images */}
          <section className={styles.quickLinks}>
            {categories.map((category: any) => (
              <Link key={category.id} href={`/category/${category.slug}`} className={styles.quickLinkCard}>
                <div className={styles.quickLinkImageWrapper}>
                  <Image
                    src={categoryImages[category.slug] || defaultCategoryImage}
                    alt={category.name}
                    width={400}
                    height={300}
                    className={styles.quickLinkImage}
                  />
                </div>
                <div className={styles.quickLinkContent}>
                  <span className={styles.quickLinkTitle}>{category.name}</span>
                  <span className={styles.quickLinkDesc}>
                    Explore our {category.name.toLowerCase()} collection
                  </span>
                </div>
              </Link>
            ))}
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

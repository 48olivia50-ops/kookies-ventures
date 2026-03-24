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
    where: { slug },
    include: { products: { orderBy: { createdAt: 'desc' } } }
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

  return (
    <div className={styles.storeContainer}>
      <CustomerHeader store={store} session={session} tenantSlug={slug} />

      <main className={styles.main}>
        <div className={styles.pageContent}>
          <div className={styles.hero}>
            <div className={styles.heroInner}>
              <span className={styles.heroPill}>🏷️ New Collection</span>
              <h1>{store.name}</h1>
              <p>Premium lifestyle essentials. {store.products.length} exclusive pieces available now.</p>
            </div>
          </div>

          {!session?.isAuth && (
            <div className={styles.guestBanner}>
              <span>👋 Browsing as guest. <Link href="/login" className={styles.guestLink}>Log in</Link> to add items to your cart.</span>
            </div>
          )}

          <div className={styles.productsGrid}>
            {store.products.map((product, idx) => (
              <div key={product.id} className={styles.productCard}>
                {product.imageUrl ? (
                  <div
                    className={styles.productImage}
                    style={{ backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                ) : (
                  <div
                    className={styles.productImage}
                    style={{ background: productPatterns[idx % productPatterns.length] }}
                  >
                    <span className={styles.productEmoji}>
                      {['👕','👖','🧥','👔','🧤','🧣','🧢','🪖','👗','🩱','🩲','🥻'][idx % 12]}
                    </span>
                  </div>
                )}
                <div className={styles.productInfo}>
                  <h3>{product.name}</h3>
                  {product.description && <p className={styles.description}>{product.description}</p>}
                  <div className={styles.priceRow}>
                    <span className={styles.price}><PriceDisplay amount={product.price} /></span>
                    <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                      {product.stock > 0 ? `✓ ${product.stock} In Stock` : '✗ Out of Stock'}
                    </span>
                  </div>
                </div>
                <AddToCartBtn product={product} isAuth={!!session?.isAuth} />
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}

import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CustomerHeader } from '@/components/CustomerHeader';
import { verifySession } from '@/lib/auth';
import { AddToCartBtn } from '@/components/CartUI';
import { PriceDisplay } from '@/components/PriceDisplay';
import Image from 'next/image';
import Link from 'next/link';
import styles from './category.module.css';

const productPatterns = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

const emojis = ['👕', '👖', '🧥', '👔', '🧤', '🧣', '🧢', '🪖', '👗', '🩱', '🩲', '🥻'];

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await verifySession();
  
  const tenantSlug = 'kookies';
  const store = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!store) notFound();

  const category = await (prisma as any).category.findUnique({
    where: { slug, tenantId: store.id },
    include: { products: { orderBy: { createdAt: 'desc' } } }
  });

  if (!category) notFound();

  return (
    <div className={styles.pageContainer}>
      <CustomerHeader store={store} session={session} tenantSlug={tenantSlug} />
      
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>{category.name}</h1>
          <p className={styles.heroSubtitle}>
            Explore our curated collection of {category.name.toLowerCase()} featuring {category.products.length} exclusive pieces.
          </p>
        </div>

        {category.products.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No {category.name} yet</h2>
            <p>We are currently updating our catalog for this collection. Please check back later!</p>
            <Link href="/" className={styles.btnPrimary} style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}>
              Return to Store
            </Link>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {category.products.map((product: any, idx: number) => (
              <div key={product.id} className={styles.productCard}>
                <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div className={styles.imageContainer}>
                    {product.imageUrl ? (
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 300px"
                        className={styles.image} 
                      />
                    ) : (
                      <div 
                        className={styles.fallbackImage}
                        style={{ background: productPatterns[idx % productPatterns.length] }}
                      >
                        <span className={styles.emoji}>{emojis[idx % emojis.length]}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.productInfo}>
                    <h3 className={styles.title}>{product.name}</h3>
                    {product.description && <p className={styles.description}>{product.description}</p>}
                    
                    <div className={styles.bottomRow}>
                      <span className={styles.price}><PriceDisplay amount={product.price} /></span>
                      <span className={`${styles.stock} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                        {product.stock > 0 ? `In Stock` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className={styles.cartBtnContainer}>
                  <AddToCartBtn product={product as any} isAuth={!!session?.isAuth} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

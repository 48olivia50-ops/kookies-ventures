import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AddToCartBtn } from '@/components/CartUI';
import { verifySession } from '@/lib/auth';
import { PriceDisplay } from '@/components/PriceDisplay';
import { CustomerHeader } from '@/components/CustomerHeader';
import { ProductImageGallery } from './ProductImageGallery';
import styles from './productDetails.module.css';

const fallbackGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

const fallbackEmojis = ['👕','👖','🧥','👔','🧤','🧣','🧢','🪖','👗','🩱','🩲','🥻'];

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifySession();
  const slug = 'kookies';

  const [store, rawProduct] = await Promise.all([
    prisma.tenant.findUnique({ where: { slug } }),
    prisma.product.findUnique({
      where: { id },
      include: { images: true, tenant: true } as any
    })
  ]);

  const product = rawProduct as any;

  if (!store || !product || product.tenant.slug !== slug) {
    notFound();
  }

  // Compile all images (main image + additional images)
  const allImages: string[] = [];
  if (product.imageUrl) allImages.push(product.imageUrl);
  if (product.images && product.images.length > 0) {
    product.images.forEach((img: any) => allImages.push(img.url));
  }

  // Fallback visual data if no images
  // We use a simple hash of the ID to consistently pick a color/emoji
  const hashVal = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackGradient = fallbackGradients[hashVal % fallbackGradients.length];
  const fallbackEmoji = fallbackEmojis[hashVal % fallbackEmojis.length];

  return (
    <>
      <CustomerHeader store={store} session={session} tenantSlug={slug} />
      
      <main className={styles.container}>
        <Link href="/" className={styles.backLink}>
          &larr; Back to Store
        </Link>
        
        <div className={styles.grid}>
          {/* Left Column: Images */}
          <ProductImageGallery 
            images={allImages} 
            productName={product.name} 
            fallbackGradient={fallbackGradient}
            fallbackEmoji={fallbackEmoji}
          />
          
          {/* Right Column: Details */}
          <div className={styles.info}>
            <h1 className={styles.title}>{product.name}</h1>
            
            <div className={styles.priceRow}>
              <span className={styles.price}><PriceDisplay amount={product.price} /></span>
              <span className={`${styles.stockStatus} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                {product.stock > 0 ? `✓ ${product.stock} In Stock` : '✗ Out of Stock'}
              </span>
            </div>

            <div className={styles.actions}>
              <AddToCartBtn product={product} isAuth={!!session?.isAuth} />
              {!session?.isAuth && (
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                   Please <Link href="/login" style={{ color: '#0f172a', textDecoration: 'underline' }}>log in</Link> to purchase this item.
                </p>
              )}
            </div>

            {product.description && (
              <div className={styles.description}>
                {product.description}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

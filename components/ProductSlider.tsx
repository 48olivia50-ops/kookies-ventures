'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './productSlider.module.css';
import { PriceDisplay } from '@/components/PriceDisplay';
import { AddToCartBtn } from '@/components/CartUI';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
}

interface ProductSliderProps {
  products: Product[];
  isAuth: boolean;
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
}

const productPatterns = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

const emojis = ['👕', '👖', '🧥', '👔', '🧤', '🧣', '🧢', '🪖', '👗', '🩱', '🩲', '🥻'];

export function ProductSlider({ products, isAuth, title = "Trending Now", subtitle = "Discover our most popular pieces", viewAllLink }: ProductSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = 320; // card width + gap
      trackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className={styles.sliderSection}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {viewAllLink && (
          <Link href={viewAllLink} className={styles.viewAllBtn}>
            View All &rarr;
          </Link>
        )}
      </div>

      <div className={styles.sliderContainer}>
        <button className={`${styles.navButton} ${styles.prevBtn}`} onClick={() => scroll('left')} aria-label="Previous products">
          &#8592;
        </button>
        
        <div className={styles.track} ref={trackRef}>
          {products.map((product, idx) => (
            <div key={product.id} className={styles.slide}>
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
                
                <div className={styles.info}>
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
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                 <AddToCartBtn product={product as any} isAuth={isAuth} />
              </div>
            </div>
          ))}
        </div>

        <button className={`${styles.navButton} ${styles.nextBtn}`} onClick={() => scroll('right')} aria-label="Next products">
          &#8594;
        </button>
      </div>
    </div>
  );
}

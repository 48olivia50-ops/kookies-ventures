'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './productDetails.module.css';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  fallbackGradient?: string;
  fallbackEmoji?: string;
}

export function ProductImageGallery({ images, productName, fallbackGradient, fallbackEmoji }: ProductImageGalleryProps) {
  const hasImages = images.length > 0;
  const [mainImageIndex, setMainImageIndex] = useState(0);

  if (!hasImages) {
    return (
      <div className={styles.gallery}>
        <div className={styles.mainImageContainer} style={{ background: fallbackGradient || '#f8fafc' }}>
          <div className={styles.placeholderImage}>
            <span className={styles.placeholderEmoji}>{fallbackEmoji || '👕'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageContainer}>
        <Image 
          src={images[mainImageIndex]} 
          alt={`${productName} - View ${mainImageIndex + 1}`} 
          fill 
          style={{ objectFit: 'cover' }} 
          priority
        />
      </div>
      
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`${styles.thumbnailBtn} ${idx === mainImageIndex ? styles.active : ''}`}
              onClick={() => setMainImageIndex(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <Image 
                src={img} 
                alt={`${productName} thumbnail ${idx + 1}`} 
                fill 
                style={{ objectFit: 'cover' }} 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

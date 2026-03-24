'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteProduct } from '@/app/actions/products';
import styles from './products.module.css';

export function ProductActions({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      startTransition(async () => {
        const result = await deleteProduct(productId);
        if (result?.error) {
          alert('Error: ' + result.error);
        } else {
          router.refresh();
        }
      });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Link href={`/admin/products/${productId}`} className={styles.btnIcon} style={{ textDecoration: 'none' }}>
        Edit
      </Link>
      <button 
        onClick={handleDelete} 
        disabled={isPending} 
        className={styles.btnIcon}
        style={{ 
          color: isPending ? '#94a3b8' : '#ef4444', 
          background: isPending ? '#f1f5f9' : 'none',
          padding: '0.4rem 0.8rem',
          borderRadius: '0.5rem',
          cursor: isPending ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}

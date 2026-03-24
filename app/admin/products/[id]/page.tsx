import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { updateProduct } from '@/app/actions/products';
import styles from '../products.module.css';
import Link from 'next/link';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { tenant: true }
  });

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/products" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-block', marginBottom: '0.5rem' }}>&larr; Back to Products</Link>
          <h1 className={styles.title}>Edit Product: {product.name}</h1>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.formSection} style={{ maxWidth: '600px' }}>
          <div className={styles.formCard}>
            <form action={updateWithId} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Product Name</label>
                <input type="text" id="name" name="name" defaultValue={product.name} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="price">Price</label>
                <input type="number" id="price" name="price" step="0.01" defaultValue={product.price} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="stock">Inventory Stock</label>
                <input type="number" id="stock" name="stock" defaultValue={product.stock} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="image">Update Image (Optional)</label>
                <input type="file" id="image" name="image" accept="image/*" className={styles.input} />
                {product.imageUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={product.imageUrl} alt="Current" style={{ height: '80px', objectFit: 'contain' }} />
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={4} defaultValue={product.description || ''} className={styles.input}></textarea>
              </div>
              <button type="submit" className={styles.btnPrimary}>Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

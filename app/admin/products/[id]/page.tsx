import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { updateProduct, deleteProductImage } from '@/app/actions/products';
import styles from '../products.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { tenant: true, images: true }
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ]);

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
                <label>Category</label>
                <select name="categoryId" defaultValue={product.categoryId || ''} className={styles.input}>
                  <option value="">No Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="images">Add More Images</label>
                <input type="file" id="images" name="images" accept="image/*" multiple className={styles.input} />
                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>You can select multiple images at once</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={4} defaultValue={product.description || ''} className={styles.input} placeholder="Enter a detailed description of the product..."></textarea>
              </div>
              <button type="submit" className={styles.btnPrimary}>Save Changes</button>
            </form>

            {/* Product Images Section moved outside of main form to prevent nested form bugs */}
            <div className={styles.formGroup} style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Current Product Images</h3>
              <div className={styles.imageGrid}>
                {product.imageUrl && (
                  <div className={styles.imagePreview}>
                    <Image src={product.imageUrl} alt="Main" width={100} height={100} style={{ objectFit: 'cover' }} />
                    <span className={styles.imageLabel}>Main</span>
                  </div>
                )}
                {product.images.map(img => (
                  <div key={img.id} className={styles.imagePreview}>
                    <Image src={img.url} alt="Image" width={100} height={100} style={{ objectFit: 'cover' }} />
                    <form action={deleteProductImage}>
                      <input type="hidden" name="imageId" value={img.id} />
                      <button type="submit" className={styles.removeImageBtn} title="Remove image">×</button>
                    </form>
                  </div>
                ))}
              </div>
            </div>

              <div className={styles.formGroup}>
                <label htmlFor="images">Add More Images</label>
                <input type="file" id="images" name="images" accept="image/*" multiple className={styles.input} />
                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>You can select multiple images at once</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={4} defaultValue={product.description || ''} className={styles.input} placeholder="Enter a detailed description of the product..."></textarea>
              </div>
              <button type="submit" className={styles.btnPrimary}>Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import styles from './products.module.css';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import fs from 'fs';
import path from 'path';
import { PriceDisplay } from '@/components/PriceDisplay';
import { ProductActions } from './ProductActions';

async function createProduct(formData: FormData) {
  'use server'
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string) || 0;
  
  // Find the single tenant
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'kookies' } });
  const tenantId = tenant?.id;
  const description = formData.get('description') as string;
  const imageFile = formData.get('image') as File | null;
  
  if (name && price && tenantId) {
    let imageUrl = null;
    try {
      if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const dirPath = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(path.join(dirPath, filename), buffer);
        imageUrl = `/uploads/${filename}`;
      }

      await prisma.product.create({
        data: { name, price, stock, tenantId, description, imageUrl }
      });
      revalidatePath('/admin/products');
      revalidatePath('/admin');
    } catch (e) {
      console.error(e);
    }
  }
}

export default async function ProductsAdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: true
    }
  });

  const tenants = await prisma.tenant.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>Manage global inventory across all shops.</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.listSection}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>In Stock</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className={styles.boldCell}>{product.name}</td>
                    <td>{product.description?.includes('Bedroom') ? 'Bedroom' : 'Fashion'}</td>
                    <td><PriceDisplay amount={product.price} /></td>
                    <td>
                      <span className={product.stock > 10 ? styles.stockGreen : styles.stockRed}>
                        {product.stock} units
                      </span>
                    </td>
                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td>
                      <ProductActions productId={product.id} />
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>No products added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2>Add New Product</h2>
            <form action={createProduct} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Product Name</label>
                <input type="text" id="name" name="name" required placeholder="Graphic Tee" className={styles.input} />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="price">Price</label>
                <input type="number" id="price" name="price" step="0.01" required placeholder="29.99" className={styles.input} />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="stock">Initial Stock</label>
                <input type="number" id="stock" name="stock" required defaultValue="50" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label>Shop Association</label>
                <input type="text" value="Kookies Ventures" disabled className={styles.input} style={{ background: '#f8fafc', color: '#64748b' }} />
                <input type="hidden" name="tenantId" value={tenants.find(t => t.slug === 'kookies')?.id || ''} />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="image">Product Image (Optional)</label>
                <input type="file" id="image" name="image" accept="image/*" className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description (Optional)</label>
                <textarea id="description" name="description" rows={3} className={styles.input} placeholder="Product details..."></textarea>
              </div>

              <button type="submit" className={styles.btnPrimary}>Save Product</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

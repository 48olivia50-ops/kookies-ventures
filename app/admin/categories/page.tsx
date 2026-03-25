import React from 'react';
import { prisma } from '@/lib/prisma';
import styles from './categories.module.css';
import { createCategory, deleteCategory } from '@/app/actions/categories';

export default async function CategoriesAdminPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categories</h1>
        <p className={styles.subtitle}>Manage product collections across your store.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.listSection}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Products Count</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category: any) => (
                  <tr key={category.id}>
                    <td className={styles.boldCell}>{category.name}</td>
                    <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{category.slug}</td>
                    <td>{category._count.products} products</td>
                    <td>
                      <form action={async () => {
                        'use server';
                        await deleteCategory(category.id);
                      }}>
                        <button type="submit" className={styles.actionBtn}>
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.emptyState}>No categories added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2>Add New Category</h2>
            <form action={createCategory}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Category Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="e.g. Duvets, Bedsheets" 
                  className={styles.input} 
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  A unique slug will be generated automatically.
                </p>
              </div>
              <button type="submit" className={styles.btnPrimary}>Create Category</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

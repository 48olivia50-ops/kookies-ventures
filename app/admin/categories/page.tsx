import React from 'react';
import { prisma } from '@/lib/prisma';
import styles from './categories.module.css';
import { CategoriesManager } from './CategoriesManager';

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
        <p className={styles.subtitle}>Manage product collections across your store. Add images to showcase your categories.</p>
      </div>

      <CategoriesManager categories={categories} />
    </div>
  );
}

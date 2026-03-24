import React from 'react';
import styles from './dashboard.module.css';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  const productsCount = await prisma.product.count();
  const totalStock = await prisma.product.aggregate({ _sum: { stock: true } });
  const ordersCount = await prisma.order.count();
  const usersCount = await prisma.user.count();

  const recentProducts = await prisma.product.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>Welcome back, here's what's happening today.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Stock Units</h3>
          <div className={styles.statValue}>
            {totalStock._sum.stock || 0}
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>Active Listings</h3>
          <div className={styles.statValue}>{productsCount}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Orders</h3>
          <div className={styles.statValue}>{ordersCount}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Customers</h3>
          <div className={styles.statValue}>{usersCount}</div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2>Latest Product Arrivals</h2>
          <Link href="/admin/products" className={styles.viewAll}>Manage All</Link>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>No products found.</td>
                </tr>
              ) : (
                recentProducts.map(product => (
                  <tr key={product.id}>
                    <td className={styles.boldCell}>{product.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock} units</td>
                    <td>
                      <span className={product.stock > 0 ? styles.badgeActive : styles.badgeOutOfStock}>
                        {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

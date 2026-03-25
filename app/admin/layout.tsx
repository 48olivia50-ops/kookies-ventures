import React from 'react';
import styles from './admin.module.css';
import Link from 'next/link';
import { verifySession } from '@/lib/auth';
import { logout } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  if (!session?.isAuth || session.role !== 'ADMIN') {
    redirect('/login');
  }

  const newOrders = await prisma.order.count({ where: { isRead: false } });
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'kookies' } });

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin">
            <Image 
              src={`${tenant?.logoUrl || "/logo.svg"}?v=${Date.now()}`} 
              alt="Kookies Ventures logo" 
              width={280} 
              height={64} 
              className="logo-transparent"
              style={{ objectFit: 'contain' }} 
              priority 
            />
          </Link>
          <span className={styles.adminBadge}>ADMIN</span>
        </div>
        <nav className={styles.navLinks}>
          <Link href="/admin" className={styles.navLink}>📊 Dashboard</Link>
          <Link href="/admin/products" className={styles.navLink}>👕 Products</Link>
          <Link href="/admin/users" className={styles.navLink}>👤 Users</Link>
          <Link href="/admin/orders" className={styles.navLink}>
            📦 Orders
            {newOrders > 0 && <span className={styles.notifBadge}>{newOrders}</span>}
          </Link>
          <Link href="/admin/categories" className={styles.navLink}>🗂️ Categories</Link>
          <Link href="/admin/settings" className={styles.navLink}>⚙️ Settings</Link>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.pageTitle}>Admin Portal</div>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>A</div>
            <span>Admin</span>
            <form action={logout}>
              <button type="submit" className={styles.logoutBtn}>Logout</button>
            </form>
          </div>
        </header>
        <div className={styles.contentArea}>{children}</div>
      </main>
    </div>
  );
}

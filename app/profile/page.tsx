import React from 'react';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CustomerHeader } from '@/components/CustomerHeader';
import { PriceDisplay } from '@/components/PriceDisplay';
import styles from './profile.module.css';

export default async function ProfilePage() {
  const session = await verifySession();
  if (!session?.isAuth) {
    redirect('/login');
  }

  const slug = 'kookies';
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  const getStatusClass = (status: string) => {
    switch(status.toUpperCase()) {
      case 'PENDING': return styles.statusPENDING;
      case 'SHIPPED': return styles.statusSHIPPED;
      case 'DELIVERED': return styles.statusDELIVERED;
      case 'CANCELLED': return styles.statusCANCELLED;
      default: return styles.statusDefault;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <CustomerHeader store={tenant} session={session} tenantSlug={slug} />

      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Welcome back, {user.name || user.email.split('@')[0]}</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Orders</div>
            <div className={styles.statValue}>{user.orders.length}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Account Email</div>
            <div className={styles.statValue} style={{ fontSize: '1.25rem', overflowWrap: 'break-word' }}>
              {user.email}
            </div>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Order History & Tracking</h2>

        {user.orders.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders with us yet. Start exploring our collection!</p>
            <Link href="/" className={styles.shopLink}>Browse Shop</Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {user.orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.trackingId}>Tracking ID: {order.trackingId}</span>
                    <span className={styles.orderDate}>
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                    {order.status}
                  </div>
                </div>

                <div className={styles.orderBody}>
                  <ul className={styles.itemsList}>
                    {order.items.map((item) => (
                      <li key={item.id} className={styles.item}>
                        <div className={styles.itemName}>
                          {item.product?.name || 'Unknown Product'} 
                          <span className={styles.itemQty}> x{item.quantity}</span>
                        </div>
                        <div className={styles.itemPrice}>
                          <PriceDisplay amount={item.price * item.quantity} />
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className={styles.orderFooter}>
                    <span className={styles.totalLabel}>Total Paid</span>
                    <span className={styles.totalAmount}>
                      <PriceDisplay amount={order.total} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

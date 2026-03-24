import React from 'react';
import styles from './orders.module.css';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PriceDisplay } from '@/components/PriceDisplay';

async function updateOrderStatus(formData: FormData) {
  'use server';
  const orderId = formData.get('orderId') as string;
  const status = formData.get('status') as string;
  if (orderId && status) {
    await prisma.order.update({ where: { id: orderId }, data: { status } });
    revalidatePath('/admin/orders');
  }
}

const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#06b6d4',
  DELIVERED: '#10b981',
  DECLINED: '#ef4444',
};

export default async function OrdersAdminPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      tenant: true,
      items: { include: { product: true } }
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Orders Tracker</h1>
          <p className={styles.subtitle}>Monitor all orders across shops with live status updates.</p>
        </div>
        <div className={styles.headerActions}>
          <form action="/api/admin/export-orders" method="GET" className={styles.exportForm}>
            <div className={styles.filterGroup}>
              <input type="date" name="from" className={styles.dateInput} title="From Date" />
              <input type="date" name="to" className={styles.dateInput} title="To Date" />
            </div>
            <button type="submit" className={styles.exportBtn}>
              📥 Export CSV
            </button>
          </form>
        </div>
      </div>

      <div className={styles.ordersList}>
        {orders.length === 0 && (
          <div className={styles.emptyState}>No orders placed yet.</div>
        )}
        {orders.map(order => {
          const stepIdx = statusSteps.indexOf(order.status);
          const trackingId = 'KV-' + order.id.slice(0, 8).toUpperCase();
          return (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <div className={styles.trackingId}>{trackingId}</div>
                  <div className={styles.orderMeta}>
                    <span>{order.user.email}</span>
                    <span>&bull;</span>
                    <span>{order.tenant.name}</span>
                    <span>&bull;</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={styles.orderTotal}><PriceDisplay amount={order.total} /></div>
              </div>

              <div className={styles.progressTracker}>
                {order.status === 'DECLINED' ? (
                  <div className={styles.progressStep} style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-start', color: statusColors.DECLINED, fontWeight: 600 }}>
                    ❌ Order Declined
                  </div>
                ) : (
                  statusSteps.map((step, i) => (
                    <div key={step} className={`${styles.progressStep} ${i <= stepIdx ? styles.progressActive : ''}`}>
                      <div className={styles.progressDot} style={i <= stepIdx ? { backgroundColor: statusColors[order.status] } : {}} />
                      <span className={styles.progressLabel}>{step.charAt(0) + step.slice(1).toLowerCase()}</span>
                      {i < statusSteps.length - 1 && (
                        <div className={`${styles.progressLine} ${i < stepIdx ? styles.progressLineActive : ''}`} />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className={styles.orderItems}>
                <strong>Items:</strong>{' '}
                {order.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}
              </div>

              <form action={updateOrderStatus} className={styles.statusForm}>
                <input type="hidden" name="orderId" value={order.id} />
                <select name="status" defaultValue={order.status} className={styles.statusSelect}>
                  {statusSteps.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="DECLINED">DECLINED</option>
                </select>
                <button type="submit" className={styles.updateBtn}>Update Status</button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}

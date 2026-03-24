import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from './confirmation.module.css';
import { PriceDisplay } from '@/components/PriceDisplay';
import { CustomerHeader } from '@/components/CustomerHeader';
import { verifySession } from '@/lib/auth';

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, tenant: true, user: true }
  });

  const session = await verifySession();

  if (!order) notFound();

  const trackingId = 'KV-' + order.id.slice(0, 8).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)' }}>
      <CustomerHeader store={order.tenant} session={session} tenantSlug={order.tenant.slug} />

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.checkmark}>✅</div>
          <h1 className={styles.title}>Order Placed!</h1>
          <p className={styles.subtitle}>Thank you for shopping with {order.tenant.name}.</p>

          <div className={styles.trackingBadge}>
            <span className={styles.trackingLabel}>Tracking ID</span>
            <span className={styles.trackingId}>{trackingId}</span>
          </div>

          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span>Payment Method</span>
              <span>{order.paymentMethod === 'PAY_ON_DELIVERY' ? '📦 Pay on Delivery' : '📱 Mobile Money'}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Order Total</span>
              <span className={styles.total}><PriceDisplay amount={order.total} /></span>
            </div>
            {order.deliveryAddress && (
              <div className={styles.detailRow}>
                <span>Delivery To</span>
                <span>{order.deliveryAddress}, {order.deliveryCity}</span>
              </div>
            )}
            {order.mobileMoneyNumber && (
              <div className={styles.detailRow}>
                <span>Mobile Money</span>
                <span>{order.mobileMoneyNumber}</span>
              </div>
            )}
          </div>

          <div className={styles.items}>
            <h3>Items Ordered</h3>
            {order.items.map(item => (
              <div key={item.id} className={styles.item}>
                <span>{item.product.name} × {item.quantity}</span>
                <span><PriceDisplay amount={item.price * item.quantity} /></span>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <Link href={`/${order.tenant.slug}`} className={styles.btnPrimary}>Continue Shopping</Link>
            <Link href="/" className={styles.btnSecondary}>Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
              <span>Order Status</span>
              <span className={styles.statusBadge}>{order.status}</span>
            </div>
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
                <span>Delivery Address</span>
                <span>{order.deliveryAddress}, {order.deliveryCity}</span>
              </div>
            )}
            {order.deliveryPhone && (
              <div className={styles.detailRow}>
                <span>Contact Phone</span>
                <span>{order.deliveryPhone}</span>
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
            <h3>Items Ordered ({order.items.length})</h3>
            {order.items.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <div className={styles.placeholderImage}>📦</div>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <h4>{item.product.name}</h4>
                  {item.product.description && (
                    <p className={styles.itemDesc}>{item.product.description}</p>
                  )}
                  <div className={styles.itemMeta}>
                    <span className={styles.itemQty}>Qty: {item.quantity}</span>
                    <span className={styles.itemPrice}><PriceDisplay amount={item.price} /> each</span>
                  </div>
                </div>
                <div className={styles.itemTotal}>
                  <PriceDisplay amount={item.price * item.quantity} />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span><PriceDisplay amount={order.total} /></span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={styles.free}>FREE</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span><PriceDisplay amount={order.total} /></span>
            </div>
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

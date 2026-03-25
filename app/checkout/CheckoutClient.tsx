'use client';
import React, { useState, useEffect } from 'react';
import styles from './checkout.module.css';
import { useCart } from '@/components/CartContext';
import { useCurrency } from '@/components/CurrencyContext';
import { placeOrder } from '@/app/actions/orders';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Props = {
  tenantSlug: string;
  isAuth: boolean;
};

export default function CheckoutClient({ tenantSlug, isAuth }: Props) {
  const { items, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [paymentMethod, setPaymentMethod] = useState('PAY_ON_DELIVERY');
  const [state, action, pending] = useActionState(placeOrder, null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Handle redirect after successful order
  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      clearCart();
      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push(state.redirectUrl);
      }, 1500);
    }
  }, [state, router, clearCart]);

  useEffect(() => {
    setMounted(true);
    if (!isAuth) setShowLoginPrompt(true);
  }, [isAuth]);

  if (!mounted) return null;

  if (showLoginPrompt && !isAuth) {
    return (
      <div className={styles.loginGate}>
        <div className={styles.loginCard}>
          <div className={styles.gateIcon}>🛒</div>
          <h2>Ready to checkout?</h2>
          <p>You need an account to place an order. It only takes a moment!</p>
          <div className={styles.gateActions}>
            <Link href="/login" className={styles.btnPrimary}>Log In</Link>
            <Link href="/login" className={styles.btnSecondary}>Create Account</Link>
          </div>
          <Link href={`/${tenantSlug}`} className={styles.backLink}>← Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.loginGate}>
        <div className={styles.loginCard}>
          <div className={styles.gateIcon}>👜</div>
          <h2>Your cart is empty</h2>
          <p>Add some items before checking out.</p>
          <Link href={`/${tenantSlug}`} className={styles.btnPrimary}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.checkoutLeft}>
        <h1 className={styles.title}>Checkout</h1>

        <div className={styles.orderSummary}>
          <h3>Order Summary</h3>
          {items.map(item => (
            <div key={item.id} className={styles.orderItem}>
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className={styles.orderTotal}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <form action={action} className={styles.form}>
          <input type="hidden" name="items" value={JSON.stringify(items)} />
          <input type="hidden" name="tenantSlug" value={tenantSlug} />
          <input type="hidden" name="paymentMethod" value={paymentMethod} />

          <div className={styles.section}>
            <h3>Payment Method</h3>
            <div className={styles.paymentOptions}>
              <label className={`${styles.paymentOption} ${paymentMethod === 'PAY_ON_DELIVERY' ? styles.selected : ''}`}>
                <input type="radio" name="_pm" value="PAY_ON_DELIVERY" checked={paymentMethod === 'PAY_ON_DELIVERY'} onChange={() => setPaymentMethod('PAY_ON_DELIVERY')} />
                <div className={styles.paymentIcon}>📦</div>
                <div>
                  <strong>Pay on Delivery</strong>
                  <p>Pay cash when your order arrives</p>
                </div>
              </label>
              <label className={`${styles.paymentOption} ${paymentMethod === 'MOBILE_MONEY' ? styles.selected : ''}`}>
                <input type="radio" name="_pm" value="MOBILE_MONEY" checked={paymentMethod === 'MOBILE_MONEY'} onChange={() => setPaymentMethod('MOBILE_MONEY')} />
                <div className={styles.paymentIcon}>📱</div>
                <div>
                  <strong>Mobile Money</strong>
                  <p>Pay via MTN, Vodafone or AirtelTigo</p>
                </div>
              </label>
            </div>
          </div>

          {paymentMethod === 'PAY_ON_DELIVERY' && (
            <div className={styles.section}>
              <h3>Delivery Information</h3>
              <div className={styles.formGroup}>
                <label>Street Address *</label>
                <input type="text" name="address" required className={styles.input} placeholder="123 Main St, Apt 4B" />
              </div>
              <div className={styles.formGroup}>
                <label>City / Town *</label>
                <input type="text" name="city" required className={styles.input} placeholder="Accra" />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number *</label>
                <input type="tel" name="phone" required className={styles.input} placeholder="+233 XX XXX XXXX" />
              </div>
            </div>
          )}

          {paymentMethod === 'MOBILE_MONEY' && (
            <div className={styles.section}>
              <h3>Mobile Money Details</h3>
              <div className={styles.formGroup}>
                <label>Mobile Money Number *</label>
                <input type="tel" name="mobileNumber" required className={styles.input} placeholder="+233 XX XXX XXXX" />
              </div>
              <div className={styles.mmInfo}>
                <p>📲 You'll receive a payment prompt on your phone after placing the order.</p>
              </div>
            </div>
          )}

          {state?.error && <div className={styles.error}>{state.error}</div>}

          {state?.success && (
            <div className={styles.success}>
              <p>✅ Order placed successfully!</p>
              <p>Redirecting to confirmation page...</p>
              {state.redirectUrl && (
                <a href={state.redirectUrl} style={{ color: '#8b5cf6', textDecoration: 'underline', marginTop: '0.5rem', display: 'inline-block' }}>
                  Click here if not redirected
                </a>
              )}
            </div>
          )}

          <button type="submit" className={styles.placeOrderBtn} disabled={pending}>
            {pending ? 'Placing Order...' : `Place Order · ${formatPrice(total)}`}
          </button>
        </form>
      </div>

      <div className={styles.checkoutRight}>
        <div className={styles.trustBox}>
          <h3>Why shop with us?</h3>
          <ul>
            <li>✅ Secure checkout</li>
            <li>🚚 Fast delivery</li>
            <li>💬 24/7 support</li>
            <li>🔄 Easy returns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { useCart } from './CartContext';
import { useCurrency } from './CurrencyContext';
import styles from './cart.module.css';
import { useRouter } from 'next/navigation';

export function CartButton({ tenantSlug }: { tenantSlug?: string }) {
  const { items, setIsCartOpen } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <button className={styles.cartBtn} onClick={() => setIsCartOpen(true)}>
      <span className={styles.cartIcon}>🛒</span>
      {count > 0 && <span className={styles.cartBadge}>{count}</span>}
      Cart
    </button>
  );
}

export function AddToCartBtn({ product, isAuth }: { product: { id: string; name: string; price: number; stock: number }; isAuth?: boolean }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const isOutOfStock = product.stock <= 0;


  const handleClick = () => {
    if (!isAuth) { router.push('/login'); return; }
    addToCart({ id: product.id, name: product.name, price: product.price, quantity: qty, stock: product.stock });
  };

  return (
    <div className={styles.addToCartWrapper}>
      {isAuth && (
        <div className={styles.qtyControl}>
          <button type="button" className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))} disabled={isOutOfStock}>−</button>
          <span className={styles.qtyVal}>{qty}</span>
          <button type="button" className={styles.qtyBtn} onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={isOutOfStock || qty >= product.stock}>+</button>
        </div>
      )}
      <button 
        className={isOutOfStock ? styles.outOfStockBtn : (isAuth ? styles.addToCartBtn : styles.loginToCartBtn)} 
        onClick={handleClick}
        disabled={isOutOfStock}
      >
        {isOutOfStock ? '🚫 Out of Stock' : (isAuth ? 'Add to Cart' : '🔒 Login to Buy')}
      </button>
    </div>
  );
}

export function CartSidebar({ tenantSlug }: { tenantSlug?: string }) {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQty, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  if (!isCartOpen) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push(`/checkout?tenant=${tenantSlug || 'kookies'}`);
  };

  return (
    <div className={styles.overlay} onClick={() => setIsCartOpen(false)}>
      <div className={styles.sidebar} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Your Cart</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>
        <div className={styles.itemsList}>
          {items.length === 0 ? (
            <p className={styles.empty}>Your cart is empty.</p>
          ) : (
            items.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <h4>{item.name}</h4>
                  <div className={styles.itemQtyRow}>
                    <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                    <span className={styles.qtyVal}>{item.quantity}</span>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  {item.quantity >= item.stock && <p className={styles.stockLimitHint}>Max stock reached</p>}
                </div>
                <div className={styles.itemAction}>
                  <p className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item.id)} className={styles.removeBtn}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

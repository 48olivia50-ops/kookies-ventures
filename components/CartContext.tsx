'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type CartItem = { id: string; name: string; price: number; quantity: number; stock: number };
type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kookies_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Migration: Ensure legacy items have a default stock value
          const migrated = parsed.map(item => {
            const stock = typeof item.stock === 'number' && !isNaN(item.stock) ? item.stock : 999;
            const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1;
            return { ...item, stock, quantity };
          });
          setItems(migrated);
        }
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('kookies_cart', JSON.stringify(items));
    }
  }, [items, loaded]);

  const addToCart = (product: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        const productStock = typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 999;
        const currentQty = typeof existing.quantity === 'number' && !isNaN(existing.quantity) ? existing.quantity : 0;
        const addQty = typeof product.quantity === 'number' && !isNaN(product.quantity) ? product.quantity : 1;
        const newQty = Math.min(productStock, currentQty + addQty);
        return prev.map(i => i.id === product.id ? { ...i, quantity: newQty } : i);
      }
      const initialQty = typeof product.quantity === 'number' && !isNaN(product.quantity) ? product.quantity : 1;
      const initialStock = typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 999;
      return [...prev, { ...product, quantity: Math.min(initialStock, initialQty) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        const itemStock = typeof i.stock === 'number' && !isNaN(i.stock) ? i.stock : 999;
        const targetQty = typeof qty === 'number' && !isNaN(qty) ? qty : 1;
        return { ...i, quantity: Math.max(1, Math.min(itemStock, targetQty)) };
      }
      return i;
    }));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

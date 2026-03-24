import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { CartProvider } from '@/components/CartContext';
import { CartSidebar } from '@/components/CartUI';

export const metadata: Metadata = {
  title: 'Kookies Ventures',
  description: 'Premium multi-tenant clothing marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CartProvider>
            {children}
            <CartSidebar tenantSlug="kookies" />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}

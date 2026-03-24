import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CurrencySelector } from './CurrencySelector';
import { CartButton } from './CartUI';
import { logout } from '@/app/actions/auth';
import type { SessionPayload } from '@/lib/auth';
import styles from './header.module.css';

interface CustomerHeaderProps {
  store: {
    name: string;
    logoUrl?: string | null;
  };
  session: { isAuth: boolean; userId: string; role: string; tenantId: string | null } | null;
  tenantSlug: string;
}

export function CustomerHeader({ store, session, tenantSlug }: CustomerHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src={`${store.logoUrl || "/logo.svg"}?v=${Date.now()}`}
              alt={`${store.name} logo`}
              height={48}
              width={180}
              className="logo-transparent"
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>
      </div>
      <nav className={styles.nav}>
        <CurrencySelector />
        <CartButton tenantSlug={tenantSlug} />
        {session?.isAuth ? (
          <div className={styles.authGroup}>
            {session.role === 'ADMIN' && (
              <Link href="/admin" className={styles.adminLink}>Admin Portal</Link>
            )}
            <form action={logout}>
              <button type="submit" className={styles.logoutBtn}>Logout</button>
            </form>
          </div>
        ) : (
          <Link href="/login" className={styles.loginLink}>Login</Link>
        )}
      </nav>
    </header>
  );
}

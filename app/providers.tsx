'use client';

import React from 'react';
import { CurrencyProvider } from '@/components/CurrencyContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      {children}
    </CurrencyProvider>
  );
}

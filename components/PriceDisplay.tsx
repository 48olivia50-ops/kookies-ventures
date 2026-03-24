'use client';

import React from 'react';
import { useCurrency } from './CurrencyContext';

export function PriceDisplay({ amount, className }: { amount: number; className?: string }) {
  const { formatPrice } = useCurrency();
  return <span className={className}>{formatPrice(amount)}</span>;
}

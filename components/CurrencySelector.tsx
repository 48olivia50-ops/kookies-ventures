'use client';

import React from 'react';
import { useCurrency } from './CurrencyContext';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label htmlFor="currency-select" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
        Currency:
      </label>
      <select
        id="currency-select"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as 'USD' | 'GHS')}
        style={{
          padding: '0.35rem 0.5rem',
          borderRadius: '4px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-main)',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="USD">🇺🇸 USD ($)</option>
        <option value="GHS">🇬🇭 GHS (GH₵)</option>
      </select>
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'GHS';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  formatPrice: (amount) => `$${amount.toFixed(2)}`,
});

export const useCurrency = () => useContext(CurrencyContext);

const EXCHANGE_RATE = 15.5; // 1 USD = 15.5 GHS

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kv_currency') as Currency;
    if (saved === 'USD' || saved === 'GHS') {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('kv_currency', c);
  };

  const formatPrice = (amountInUSD: number) => {
    if (currency === 'GHS') {
      return `GH₵${(amountInUSD * EXCHANGE_RATE).toFixed(2)}`;
    }
    return `$${amountInUSD.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

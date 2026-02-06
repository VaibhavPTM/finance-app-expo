import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Transaction, Category, PaymentMethod } from '../types/finance';
import { defaultCategories, defaultPaymentMethods } from '../utils/finance';
import * as storage from '../storage';

type FinanceContextType = {
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => void;
  addPaymentMethod: (p: Omit<PaymentMethod, 'id'>) => void;
  loadData: () => Promise<void>;
};

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txs, cats, methods] = await Promise.all([
        storage.loadTransactions(),
        storage.loadCategories(),
        storage.loadPaymentMethods(),
      ]);
      if (txs.length > 0) setTransactions(txs);
      if (cats.length > 0) setCategories(cats);
      if (methods.length > 0) setPaymentMethods(methods);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const persistTransactions = useCallback((next: Transaction[]) => {
    setTransactions(next);
    storage.saveTransactions(next);
  }, []);

  const persistCategories = useCallback((next: Category[]) => {
    setCategories(next);
    storage.saveCategories(next);
  }, []);

  const persistPaymentMethods = useCallback((next: PaymentMethod[]) => {
    setPaymentMethods(next);
    storage.savePaymentMethods(next);
  }, []);

  const addTransaction = useCallback(
    (t: Omit<Transaction, 'id'>) => {
      const newT: Transaction = { ...t, id: Date.now().toString() };
      persistTransactions([newT, ...transactions]);
    },
    [transactions, persistTransactions]
  );

  const updateTransaction = useCallback(
    (id: string, t: Omit<Transaction, 'id'>) => {
      persistTransactions(
        transactions.map((x) => (x.id === id ? { ...t, id } : x))
      );
    },
    [transactions, persistTransactions]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      persistTransactions(transactions.filter((x) => x.id !== id));
    },
    [transactions, persistTransactions]
  );

  const addCategory = useCallback(
    (c: Omit<Category, 'id'>) => {
      const newC: Category = { ...c, id: `custom-${Date.now()}` };
      persistCategories([...categories, newC]);
    },
    [categories, persistCategories]
  );

  const addPaymentMethod = useCallback(
    (p: Omit<PaymentMethod, 'id'>) => {
      const newP: PaymentMethod = { ...p, id: `custom-${Date.now()}` };
      persistPaymentMethods([...paymentMethods, newP]);
    },
    [paymentMethods, persistPaymentMethods]
  );

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        paymentMethods,
        isLoading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        addPaymentMethod,
        loadData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}

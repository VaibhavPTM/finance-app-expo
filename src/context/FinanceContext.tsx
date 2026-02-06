import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { Transaction, Category, PaymentMethod } from '../types/finance';
import { defaultCategories, defaultPaymentMethods } from '../utils/finance';
import * as storage from '../storage';

type FinanceContextType = {
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  quickAddCategoryIds: string[];
  isLoading: boolean;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => void;
  addPaymentMethod: (p: Omit<PaymentMethod, 'id'>) => void;
  setQuickAddCategoryIds: (ids: string[]) => void;
  loadData: () => Promise<void>;
};

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);
  const [quickAddCategoryIds, setQuickAddCategoryIdsState] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txs, cats, methods, quickIds] = await Promise.all([
        storage.loadTransactions(),
        storage.loadCategories(),
        storage.loadPaymentMethods(),
        storage.loadQuickAddCategoryIds(),
      ]);
      if (txs.length > 0) setTransactions(txs);
      if (cats.length > 0) setCategories(cats);
      if (methods.length > 0) setPaymentMethods(methods);
      if (quickIds.length > 0) setQuickAddCategoryIdsState(quickIds);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setQuickAddCategoryIds = useCallback((ids: string[]) => {
    setQuickAddCategoryIdsState(ids);
    storage.saveQuickAddCategoryIds(ids);
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const newT: Transaction = { ...t, id: Date.now().toString() };
    setTransactions((prev) => {
      const next = [newT, ...prev];
      storage.saveTransactions(next);
      return next;
    });
  }, []);

  const updateTransaction = useCallback((id: string, t: Omit<Transaction, 'id'>) => {
    setTransactions((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...t, id } : x));
      storage.saveTransactions(next);
      return next;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((x) => x.id !== id);
      storage.saveTransactions(next);
      return next;
    });
  }, []);

  const addCategory = useCallback((c: Omit<Category, 'id'>) => {
    const newC: Category = { ...c, id: `custom-${Date.now()}` };
    setCategories((prev) => {
      const next = [...prev, newC];
      storage.saveCategories(next);
      return next;
    });
  }, []);

  const addPaymentMethod = useCallback((p: Omit<PaymentMethod, 'id'>) => {
    const newP: PaymentMethod = { ...p, id: `custom-${Date.now()}` };
    setPaymentMethods((prev) => {
      const next = [...prev, newP];
      storage.savePaymentMethods(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      transactions,
      categories,
      paymentMethods,
      quickAddCategoryIds,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      addPaymentMethod,
      setQuickAddCategoryIds,
      loadData,
    }),
    [
      transactions,
      categories,
      paymentMethods,
      quickAddCategoryIds,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      addPaymentMethod,
      setQuickAddCategoryIds,
      loadData,
    ]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category, PaymentMethod } from './types/finance';

const KEY_TRANSACTIONS = '@finance/transactions';
const KEY_CATEGORIES = '@finance/categories';
const KEY_PAYMENT_METHODS = '@finance/payment_methods';

function serializeTransaction(t: Transaction) {
  return { ...t, date: t.date.toISOString() };
}

function deserializeTransaction(t: any): Transaction {
  return { ...t, date: new Date(t.date) };
}

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_TRANSACTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return (parsed as any[]).map(deserializeTransaction);
  } catch {
    return [];
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(
    KEY_TRANSACTIONS,
    JSON.stringify(transactions.map(serializeTransaction))
  );
}

export async function loadCategories(): Promise<Category[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_CATEGORIES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(KEY_CATEGORIES, JSON.stringify(categories));
}

export async function loadPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PAYMENT_METHODS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function savePaymentMethods(methods: PaymentMethod[]): Promise<void> {
  await AsyncStorage.setItem(KEY_PAYMENT_METHODS, JSON.stringify(methods));
}

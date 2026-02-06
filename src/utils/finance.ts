import {
  format,
  isToday,
  isYesterday,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  isWithinInterval,
  endOfDay,
} from 'date-fns';
import { Transaction, Category, PaymentMethod, TimePeriod } from '../types/finance';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
};

export const groupTransactionsByDate = (transactions: Transaction[]): Map<string, Transaction[]> => {
  const groups = new Map<string, Transaction[]>();
  transactions.forEach((transaction) => {
    const dateKey = format(startOfDay(transaction.date), 'yyyy-MM-dd');
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, transaction]);
  });
  return groups;
};

export const calculateTotals = (transactions: Transaction[]) => {
  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return { income, expenses, balance: income - expenses };
};

export const getExpensesByCategory = (
  transactions: Transaction[]
): { category: Category; amount: number; percentage: number }[] => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const categoryMap = new Map<string, { category: Category; amount: number }>();
  expenses.forEach((transaction) => {
    const existing = categoryMap.get(transaction.category.id);
    if (existing) {
      existing.amount += transaction.amount;
    } else {
      categoryMap.set(transaction.category.id, {
        category: transaction.category,
        amount: transaction.amount,
      });
    }
  });
  return Array.from(categoryMap.values())
    .map((item) => ({
      ...item,
      percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const getDateRangeForPeriod = (
  period: TimePeriod,
  customRange?: { start: Date; end: Date }
) => {
  const now = new Date();
  switch (period) {
    case 'this-week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'last-week': {
      const lastWeek = subWeeks(now, 1);
      return {
        start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      };
    }
    case 'this-month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'last-month': {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    case 'custom':
      if (customRange) return customRange;
      return { start: new Date(0), end: now };
    case 'all':
    default:
      return { start: new Date(0), end: new Date(2100, 0, 1) };
  }
};

export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  period: TimePeriod,
  customRange?: { start: Date; end: Date }
): Transaction[] => {
  if (period === 'all') return transactions;
  const dateRange = getDateRangeForPeriod(period, customRange);
  return transactions.filter((transaction) =>
    isWithinInterval(transaction.date, {
      start: startOfDay(dateRange.start),
      end: endOfDay(dateRange.end),
    })
  );
};

export const formatTimePeriod = (period: TimePeriod): string => {
  switch (period) {
    case 'this-week':
      return 'This Week';
    case 'last-week':
      return 'Last Week';
    case 'this-month':
      return 'This Month';
    case 'last-month':
      return 'Last Month';
    case 'custom':
      return 'Custom';
    case 'all':
    default:
      return 'All Time';
  }
};

export const defaultCategories: Category[] = [
  { id: 'salary', name: 'Salary', icon: 'Briefcase', color: '#10b981', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'Laptop', color: '#06b6d4', type: 'income' },
  { id: 'investment', name: 'Investment', icon: 'TrendingUp', color: '#3b82f6', type: 'income' },
  { id: 'gift', name: 'Gift', icon: 'Gift', color: '#8b5cf6', type: 'income' },
  { id: 'other-income', name: 'Other', icon: 'DollarSign', color: '#14b8a6', type: 'income' },
  { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#ef4444', type: 'expense' },
  { id: 'transport', name: 'Transportation', icon: 'Car', color: '#f97316', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#f59e0b', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#ec4899', type: 'expense' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'FileText', color: '#ef4444', type: 'expense' },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', color: '#dc2626', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#f97316', type: 'expense' },
  { id: 'fitness', name: 'Fitness', icon: 'Dumbbell', color: '#f59e0b', type: 'expense' },
  { id: 'other-expense', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280', type: 'expense' },
];

export const defaultPaymentMethods: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', type: 'cash', icon: 'Wallet' },
  { id: 'bank1', name: 'Chase Checking', type: 'bank', icon: 'Building2' },
  { id: 'bank2', name: 'Wells Fargo Savings', type: 'bank', icon: 'Building2' },
  { id: 'credit1', name: 'Visa Credit Card', type: 'credit-card', icon: 'CreditCard' },
];

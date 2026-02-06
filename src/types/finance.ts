export type TransactionType = 'income' | 'expense';

export type PaymentMethod = {
  id: string;
  name: string;
  type: 'bank' | 'credit-card' | 'cash';
  icon?: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  /** Main category has no parentId; subcategory has parentId = main category id */
  parentId?: string | null;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  paymentMethod: PaymentMethod;
  date: Date;
  notes?: string;
};

export type TimePeriod = 'all' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';

export type TransactionTypeFilter = 'all' | 'income' | 'expense';

export type FilterOptions = {
  sortBy: 'date-newest' | 'date-oldest' | 'amount-highest' | 'amount-lowest';
  categoryId?: string;
  paymentMethodId?: string;
  searchQuery?: string;
  timePeriod: TimePeriod;
  transactionType?: TransactionTypeFilter;
  customDateRange?: {
    start: Date;
    end: Date;
  };
};

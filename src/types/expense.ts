export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note?: string;
  date: string; // ISO string
  createdAt: string;
}

export interface ExpenseContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  searchTransactions: (query: string) => Transaction[];
  filterTransactionsByDate: (startDate?: string, endDate?: string) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getBalance: () => number;
  getCategoryTotals: () => Record<string, { total: number; count: number }>;
  addCustomCategory: (category: Omit<Category, 'id'>) => Category;
  updateCustomCategory: (id: string, category: Partial<Category>) => void;
  deleteCustomCategory: (id: string) => void;
  getAllCategories: () => Category[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface DateFilter {
  type: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
}
export interface Budget {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  spentAmount: number;
  category: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface BudgetTransaction {
  id: string;
  budgetId: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface BudgetContextType {
  budgets: Budget[];
  budgetTransactions: BudgetTransaction[];
  addBudget: (budget: Omit<Budget, 'id' | 'spentAmount' | 'createdAt'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addBudgetTransaction: (transaction: Omit<BudgetTransaction, 'id' | 'createdAt'>) => void;
  updateBudgetTransaction: (id: string, transaction: Partial<BudgetTransaction>) => void;
  deleteBudgetTransaction: (id: string) => void;
  getBudgetSpent: (budgetId: string) => number;
  getBudgetTransactions: (budgetId: string) => BudgetTransaction[];
}
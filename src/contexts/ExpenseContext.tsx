import React, { createContext, useContext, useEffect, useState } from 'react';
import { Transaction, ExpenseContextType, Category } from '@/types/expense';
import { defaultCategories } from '@/constants/categories';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('expense-tracker-transactions');
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }
  }, []);

  // Load custom categories from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('expense-tracker-custom-categories');
    if (saved) {
      try {
        setCustomCategories(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading custom categories:', error);
      }
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Save custom categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expense-tracker-custom-categories', JSON.stringify(customCategories));
  }, [customCategories]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id
          ? { ...transaction, ...updatedTransaction }
          : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const searchTransactions = (query: string): Transaction[] => {
    if (!query.trim()) return transactions;
    
    const lowercaseQuery = query.toLowerCase();
    return transactions.filter(transaction =>
      transaction.category.toLowerCase().includes(lowercaseQuery) ||
      transaction.note?.toLowerCase().includes(lowercaseQuery) ||
      transaction.amount.toString().includes(lowercaseQuery)
    );
  };

  const filterTransactionsByDate = (startDate?: string, endDate?: string): Transaction[] => {
    if (!startDate && !endDate) return transactions;

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return transactionDate >= start && transactionDate <= end;
      } else if (start) {
        return transactionDate >= start;
      } else if (end) {
        return transactionDate <= end;
      }
      return true;
    });
  };

  const getTotalIncome = (): number => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpense = (): number => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = (): number => {
    return getTotalIncome() - getTotalExpense();
  };

  const getCategoryTotals = (): Record<string, { total: number; count: number }> => {
    const categoryTotals: Record<string, { total: number; count: number }> = {};
    
    transactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = { total: 0, count: 0 };
      }
      categoryTotals[transaction.category].total += transaction.amount;
      categoryTotals[transaction.category].count += 1;
    });

    return categoryTotals;
  };

  const addCustomCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setCustomCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCustomCategory = (id: string, updatedCategory: Partial<Category>) => {
    setCustomCategories(prev =>
      prev.map(category =>
        category.id === id
          ? { ...category, ...updatedCategory }
          : category
      )
    );
  };

  const deleteCustomCategory = (id: string) => {
    setCustomCategories(prev => prev.filter(category => category.id !== id));
  };

  const getAllCategories = (): Category[] => {
    return [...defaultCategories, ...customCategories];
  };

  const value: ExpenseContextType = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    searchTransactions,
    filterTransactionsByDate,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    getCategoryTotals,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
    getAllCategories,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
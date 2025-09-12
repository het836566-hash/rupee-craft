import React, { createContext, useContext, useEffect, useState } from 'react';
import { Transaction, ExpenseContextType } from '@/types/expense';

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

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions));
  }, [transactions]);

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
    
    console.log('Processing transactions for category totals:', transactions);
    
    transactions.forEach(transaction => {
      console.log('Processing transaction:', transaction);
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = { total: 0, count: 0 };
      }
      categoryTotals[transaction.category].total += transaction.amount;
      categoryTotals[transaction.category].count += 1;
    });

    console.log('Final category totals:', categoryTotals);
    return categoryTotals;
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
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
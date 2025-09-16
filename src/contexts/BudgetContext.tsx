import React, { createContext, useContext, useState, useEffect } from 'react';
import { Budget, BudgetTransaction, BudgetContextType } from '@/types/budget';
import { useExpense } from './ExpenseContext';

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addTransaction } = useExpense();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetTransactions, setBudgetTransactions] = useState<BudgetTransaction[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem('expense-tracker-budgets');
    const savedBudgetTransactions = localStorage.getItem('expense-tracker-budget-transactions');
    
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    if (savedBudgetTransactions) {
      setBudgetTransactions(JSON.parse(savedBudgetTransactions));
    }
  }, []);

  // Save budgets to localStorage
  useEffect(() => {
    localStorage.setItem('expense-tracker-budgets', JSON.stringify(budgets));
    // Recalculate spent amounts
    const updatedBudgets = budgets.map(budget => ({
      ...budget,
      spentAmount: getBudgetSpent(budget.id)
    }));
    if (JSON.stringify(updatedBudgets) !== JSON.stringify(budgets)) {
      setBudgets(updatedBudgets);
    }
  }, [budgets, budgetTransactions]);

  // Save budget transactions to localStorage
  useEffect(() => {
    localStorage.setItem('expense-tracker-budget-transactions', JSON.stringify(budgetTransactions));
  }, [budgetTransactions]);

  const addBudget = (budgetData: Omit<Budget, 'id' | 'spentAmount' | 'createdAt'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: Date.now().toString(),
      spentAmount: 0,
      createdAt: new Date().toISOString(),
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (id: string, updatedBudget: Partial<Budget>) => {
    setBudgets(prev => prev.map(budget => 
      budget.id === id ? { ...budget, ...updatedBudget } : budget
    ));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
    setBudgetTransactions(prev => prev.filter(transaction => transaction.budgetId !== id));
  };

  const addBudgetTransaction = (transactionData: Omit<BudgetTransaction, 'id' | 'createdAt'>) => {
    const newTransaction: BudgetTransaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setBudgetTransactions(prev => [...prev, newTransaction]);
    
    // Also add to main expense tracking
    const budget = budgets.find(b => b.id === transactionData.budgetId);
    if (budget) {
      addTransaction({
        type: 'expense',
        amount: transactionData.amount,
        category: budget.category,
        note: `Budget: ${budget.name} - ${transactionData.description}`,
        date: transactionData.date,
      });
    }
  };

  const updateBudgetTransaction = (id: string, updatedTransaction: Partial<BudgetTransaction>) => {
    setBudgetTransactions(prev => prev.map(transaction => 
      transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
    ));
  };

  const deleteBudgetTransaction = (id: string) => {
    setBudgetTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const getBudgetSpent = (budgetId: string): number => {
    return budgetTransactions
      .filter(transaction => transaction.budgetId === budgetId)
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getBudgetTransactions = (budgetId: string): BudgetTransaction[] => {
    return budgetTransactions.filter(transaction => transaction.budgetId === budgetId);
  };

  const value: BudgetContextType = {
    budgets,
    budgetTransactions,
    addBudget,
    updateBudget,
    deleteBudget,
    addBudgetTransaction,
    updateBudgetTransaction,
    deleteBudgetTransaction,
    getBudgetSpent,
    getBudgetTransactions,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
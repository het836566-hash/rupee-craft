import React, { createContext, useContext, useState, useEffect } from 'react';
import { SplitGroup, SplitExpense, SplitBalance, SplitContextType } from '@/types/split';

const SplitContext = createContext<SplitContextType | undefined>(undefined);

export const useSplit = () => {
  const context = useContext(SplitContext);
  if (!context) {
    throw new Error('useSplit must be used within a SplitProvider');
  }
  return context;
};

export const SplitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([]);
  const [splitExpenses, setSplitExpenses] = useState<SplitExpense[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedGroups = localStorage.getItem('expense-tracker-split-groups');
    const savedExpenses = localStorage.getItem('expense-tracker-split-expenses');
    
    if (savedGroups) {
      setSplitGroups(JSON.parse(savedGroups));
    }
    if (savedExpenses) {
      setSplitExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('expense-tracker-split-groups', JSON.stringify(splitGroups));
    // Update total amounts
    const updatedGroups = splitGroups.map(group => ({
      ...group,
      totalAmount: getSplitGroupExpenses(group.id).reduce((sum, expense) => sum + expense.amount, 0)
    }));
    if (JSON.stringify(updatedGroups) !== JSON.stringify(splitGroups)) {
      setSplitGroups(updatedGroups);
    }
  }, [splitGroups, splitExpenses]);

  useEffect(() => {
    localStorage.setItem('expense-tracker-split-expenses', JSON.stringify(splitExpenses));
  }, [splitExpenses]);

  const addSplitGroup = (groupData: Omit<SplitGroup, 'id' | 'totalAmount' | 'createdAt'>) => {
    const newGroup: SplitGroup = {
      ...groupData,
      id: Date.now().toString(),
      totalAmount: 0,
      createdAt: new Date().toISOString(),
    };
    setSplitGroups(prev => [...prev, newGroup]);
  };

  const updateSplitGroup = (id: string, updatedGroup: Partial<SplitGroup>) => {
    setSplitGroups(prev => prev.map(group => 
      group.id === id ? { ...group, ...updatedGroup } : group
    ));
  };

  const deleteSplitGroup = (id: string) => {
    setSplitGroups(prev => prev.filter(group => group.id !== id));
    setSplitExpenses(prev => prev.filter(expense => expense.splitGroupId !== id));
  };

  const addSplitExpense = (expenseData: Omit<SplitExpense, 'id' | 'createdAt'>) => {
    const newExpense: SplitExpense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSplitExpenses(prev => [...prev, newExpense]);
  };

  const updateSplitExpense = (id: string, updatedExpense: Partial<SplitExpense>) => {
    setSplitExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...updatedExpense } : expense
    ));
  };

  const deleteSplitExpense = (id: string) => {
    setSplitExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const getSplitGroupExpenses = (groupId: string): SplitExpense[] => {
    return splitExpenses.filter(expense => expense.splitGroupId === groupId);
  };

  const calculateSplitBalances = (groupId: string): SplitBalance[] => {
    const expenses = getSplitGroupExpenses(groupId);
    const group = splitGroups.find(g => g.id === groupId);
    if (!group) return [];

    // Calculate what each person owes/is owed
    const balances: Record<string, number> = {};
    
    // Initialize balances for all members
    group.members.forEach(memberId => {
      balances[memberId] = 0;
    });

    expenses.forEach(expense => {
      const shareAmount = expense.amount / expense.splitAmong.length;
      
      // Person who paid gets credited
      balances[expense.paidBy] += expense.amount;
      
      // People who share the expense get debited
      expense.splitAmong.forEach(memberId => {
        balances[memberId] -= shareAmount;
      });
    });

    // Convert to balance transfers
    const transfers: SplitBalance[] = [];
    const creditors = Object.entries(balances).filter(([_, amount]) => amount > 0);
    const debtors = Object.entries(balances).filter(([_, amount]) => amount < 0);

    creditors.forEach(([creditorId, creditAmount]) => {
      debtors.forEach(([debtorId, debtAmount]) => {
        if (Math.abs(debtAmount) > 0.01 && creditAmount > 0.01) {
          const transferAmount = Math.min(creditAmount, Math.abs(debtAmount));
          transfers.push({
            fromFriend: debtorId,
            toFriend: creditorId,
            amount: transferAmount
          });
          
          balances[creditorId] -= transferAmount;
          balances[debtorId] += transferAmount;
        }
      });
    });

    return transfers.filter(transfer => transfer.amount > 0.01);
  };

  const value: SplitContextType = {
    splitGroups,
    splitExpenses,
    addSplitGroup,
    updateSplitGroup,
    deleteSplitGroup,
    addSplitExpense,
    updateSplitExpense,
    deleteSplitExpense,
    getSplitGroupExpenses,
    calculateSplitBalances,
  };

  return (
    <SplitContext.Provider value={value}>
      {children}
    </SplitContext.Provider>
  );
};
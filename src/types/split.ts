import { Friend } from './friends';

export interface SplitGroup {
  id: string;
  name: string;
  description?: string;
  members: string[]; // friend IDs
  totalAmount: number;
  createdAt: string;
}

export interface SplitExpense {
  id: string;
  splitGroupId: string;
  description: string;
  amount: number;
  paidBy: string; // friend ID
  splitAmong: string[]; // friend IDs
  date: string;
  createdAt: string;
}

export interface SplitBalance {
  fromFriend: string;
  toFriend: string;
  amount: number;
}

export interface SplitContextType {
  splitGroups: SplitGroup[];
  splitExpenses: SplitExpense[];
  addSplitGroup: (group: Omit<SplitGroup, 'id' | 'totalAmount' | 'createdAt'>) => void;
  updateSplitGroup: (id: string, group: Partial<SplitGroup>) => void;
  deleteSplitGroup: (id: string) => void;
  addSplitExpense: (expense: Omit<SplitExpense, 'id' | 'createdAt'>) => void;
  updateSplitExpense: (id: string, expense: Partial<SplitExpense>) => void;
  deleteSplitExpense: (id: string) => void;
  getSplitGroupExpenses: (groupId: string) => SplitExpense[];
  calculateSplitBalances: (groupId: string) => SplitBalance[];
}
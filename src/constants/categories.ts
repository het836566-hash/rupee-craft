import { Category } from '@/types/expense';

export const defaultCategories: Category[] = [
  // Expense Categories
  { id: '1', name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B', type: 'expense' },
  { id: '2', name: 'Transportation', icon: '🚗', color: '#4ECDC4', type: 'expense' },
  { id: '3', name: 'Shopping', icon: '🛍️', color: '#45B7D1', type: 'expense' },
  { id: '4', name: 'Entertainment', icon: '🎬', color: '#96CEB4', type: 'expense' },
  { id: '5', name: 'Bills & Utilities', icon: '💡', color: '#FECA57', type: 'expense' },
  { id: '6', name: 'Healthcare', icon: '🏥', color: '#FF9FF3', type: 'expense' },
  { id: '7', name: 'Education', icon: '📚', color: '#54A0FF', type: 'expense' },
  { id: '8', name: 'Travel', icon: '✈️', color: '#5F27CD', type: 'expense' },
  { id: '9', name: 'Groceries', icon: '🛒', color: '#00D2D3', type: 'expense' },
  { id: '10', name: 'Personal Care', icon: '💄', color: '#FF9FF3', type: 'expense' },
  
  // Income Categories
  { id: '11', name: 'Salary', icon: '💼', color: '#26de81', type: 'income' },
  { id: '12', name: 'Freelance', icon: '💻', color: '#2bcbba', type: 'income' },
  { id: '13', name: 'Investment', icon: '📈', color: '#0fb9b1', type: 'income' },
  { id: '14', name: 'Business', icon: '🏢', color: '#20bf6b', type: 'income' },
  { id: '15', name: 'Gift', icon: '🎁', color: '#26de81', type: 'income' },
  { id: '16', name: 'Other Income', icon: '💰', color: '#2bcbba', type: 'income' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return defaultCategories.find(cat => cat.id === id);
};

export const getCategoriesByType = (type: 'income' | 'expense'): Category[] => {
  return defaultCategories.filter(cat => cat.type === type || cat.type === 'both');
};
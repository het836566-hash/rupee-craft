import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useExpense } from '@/contexts/ExpenseContext';
import { cn } from '@/lib/utils';

const BalanceSummary: React.FC = () => {
  const { getTotalIncome, getTotalExpense, getBalance } = useExpense();

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const balance = getBalance();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* Total Income */}
      <div className="glass-card card-success p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-income/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-income" />
          </div>
        </div>
      </div>

      {/* Total Expense */}
      <div className="glass-card card-expense p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Expense</p>
            <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-expense/20 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-expense" />
          </div>
        </div>
      </div>

      {/* Net Balance */}
      <div className="glass-card card-balance p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Net Balance</p>
            <p className={cn(
              "text-2xl font-bold",
              balance >= 0 ? "text-income" : "text-expense"
            )}>
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
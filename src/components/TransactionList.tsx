import React from 'react';
import { Transaction } from '@/types/expense';
import { getCategoryById } from '@/constants/categories';
import { TrendingUp, TrendingDown, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExpense } from '@/contexts/ExpenseContext';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit }) => {
  const { deleteTransaction } = useExpense();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="glass-card p-8 rounded-lg text-center">
        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
        <p className="text-muted-foreground">
          Start tracking your expenses by adding your first transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const category = getCategoryById(transaction.category);
        const isIncome = transaction.type === 'income';

        return (
          <div
            key={transaction.id}
            className={cn(
              "glass-card p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]",
              isIncome ? "card-success" : "card-expense"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-lg",
                  isIncome ? "bg-income/20" : "bg-expense/20"
                )}>
                  {category?.icon || (isIncome ? '💰' : '💸')}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-foreground">
                      {category?.name || transaction.category}
                    </h4>
                    {isIncome ? (
                      <TrendingUp className="w-4 h-4 text-income" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-expense" />
                    )}
                  </div>
                  
                  {transaction.note && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {transaction.note}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className={cn(
                    "text-lg font-bold",
                    isIncome ? "text-income" : "text-expense"
                  )}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(transaction)}
                      className="w-8 h-8 p-0 hover:bg-primary/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTransaction(transaction.id)}
                    className="w-8 h-8 p-0 hover:bg-destructive/20 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
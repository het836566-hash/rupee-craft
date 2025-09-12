import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '@/contexts/ExpenseContext';
import { getCategoriesByType, defaultCategories } from '@/constants/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { addTransaction } = useExpense();
  const { toast } = useToast();
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = getCategoriesByType(type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast({
        title: "Missing fields",
        description: "Please fill in amount and category",
        variant: "destructive"
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    addTransaction({
      type,
      amount: numAmount,
      category,
      note: note.trim() || undefined,
      date,
    });

    toast({
      title: "Transaction added",
      description: `₹${numAmount.toLocaleString('en-IN')} ${type} recorded successfully`,
    });

    // Reset form
    setAmount('');
    setCategory('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    
    // Navigate back to home
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-card-border">
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Add Transaction</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={cn(
                  "flex items-center justify-center p-4 rounded-lg transition-all duration-200",
                  "glass-card border-2",
                  type === 'expense'
                    ? "border-expense card-expense"
                    : "border-card-border hover:border-expense/50"
                )}
              >
                <TrendingDown className="w-5 h-5 mr-2 text-expense" />
                <span className="font-medium">Expense</span>
              </button>
              
              <button
                type="button"
                onClick={() => setType('income')}
                className={cn(
                  "flex items-center justify-center p-4 rounded-lg transition-all duration-200",
                  "glass-card border-2",
                  type === 'income'
                    ? "border-income card-success"
                    : "border-card-border hover:border-income/50"
                )}
              >
                <TrendingUp className="w-5 h-5 mr-2 text-income" />
                <span className="font-medium">Income</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg font-semibold glass-card border-card-border"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Category</label>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-all duration-200",
                    "glass-card border text-left",
                    category === cat.name
                      ? "border-primary bg-primary/10"
                      : "border-card-border hover:border-primary/50"
                  )}
                >
                  <span className="text-lg mr-3">{cat.icon}</span>
                  <span className="text-sm font-medium truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="glass-card border-card-border"
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Note (Optional)</label>
            <Textarea
              placeholder="Add a note about this transaction..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="glass-card border-card-border resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full btn-primary-glass py-6 text-lg font-semibold"
            disabled={!amount || !category}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add {type === 'income' ? 'Income' : 'Expense'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
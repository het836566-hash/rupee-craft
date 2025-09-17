import React, { useState } from 'react';
import { useBudget } from '@/contexts/BudgetContext';
import { useExpense } from '@/contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Wallet, Calendar, Trash2, Edit, DollarSign, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Budget: React.FC = () => {
  const { budgets, addBudget, deleteBudget, addBudgetTransaction } = useBudget();
  const { getAllCategories } = useExpense();
  const { toast } = useToast();
  
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  
  const [newBudget, setNewBudget] = useState({
    name: '',
    description: '',
    targetAmount: '',
    category: '',
    startDate: '',
    endDate: ''
  });

  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddBudget = () => {
    if (!newBudget.name || !newBudget.targetAmount || !newBudget.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    addBudget({
      name: newBudget.name,
      description: newBudget.description,
      targetAmount: parseFloat(newBudget.targetAmount),
      category: newBudget.category,
      startDate: newBudget.startDate || new Date().toISOString(),
      endDate: newBudget.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    toast({
      title: "Success",
      description: "Budget created successfully"
    });

    setNewBudget({
      name: '',
      description: '',
      targetAmount: '',
      category: '',
      startDate: '',
      endDate: ''
    });
    setIsBudgetDialogOpen(false);
  };

  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description || !selectedBudgetId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    addBudgetTransaction({
      budgetId: selectedBudgetId,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      date: newTransaction.date,
    });

    toast({
      title: "Success",
      description: "Transaction added to budget"
    });

    setNewTransaction({
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setIsTransactionDialogOpen(false);
    setSelectedBudgetId('');
  };

  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-card-border">
        <div className="p-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Budget Tracker
            </h1>
            <p className="text-muted-foreground">Set and track your spending goals</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
...
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="p-4 space-y-4">
        {budgets.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
            <p className="text-muted-foreground">Create your first budget to start tracking your spending goals.</p>
          </Card>
        ) : (
          budgets.map((budget) => {
            const progress = budget.targetAmount > 0 ? (budget.spentAmount / budget.targetAmount) * 100 : 0;
            const isOverBudget = progress > 100;
            
            return (
              <Card key={budget.id} className={cn(
                "glass-card",
                isOverBudget && "border-destructive/50"
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        {budget.name}
                      </CardTitle>
                      {budget.description && (
                        <p className="text-sm text-muted-foreground mt-1">{budget.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBudgetId(budget.id);
                          setIsTransactionDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Expense
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteBudget(budget.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={cn(
                        "font-medium",
                        isOverBudget ? "text-destructive" : "text-foreground"
                      )}>
                        {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.targetAmount)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(progress, 100)} 
                      className={cn(
                        "h-2",
                        isOverBudget && "[&>div]:bg-destructive"
                      )}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {Math.round(progress)}% used
                      </span>
                      <span className={cn(
                        "font-medium",
                        isOverBudget ? "text-destructive" : progress > 80 ? "text-yellow-500" : "text-income"
                      )}>
                        {formatCurrency(budget.targetAmount - budget.spentAmount)} remaining
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(budget.startDate), 'MMM dd')} - {format(new Date(budget.endDate), 'MMM dd')}
                      </span>
                      <span>Category: {budget.category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle>Add Expense to Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What was this expense for?"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTransaction} className="flex-1">
                Add Expense
              </Button>
              <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budget;
import React, { useMemo } from 'react';
import { useExpense } from '@/contexts/ExpenseContext';
import { getCategoryById } from '@/constants/categories';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';

const Analytics: React.FC = () => {
  const { transactions, getTotalIncome, getTotalExpense, getCategoryTotals } = useExpense();

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const categoryTotals = getCategoryTotals();

  // Prepare data for charts - only expense categories
  const categoryData = useMemo(() => {
    // Filter transactions to only include expenses
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Create category totals for expenses only
    const expenseCategoryTotals: Record<string, { total: number; count: number }> = {};
    expenseTransactions.forEach(transaction => {
      if (!expenseCategoryTotals[transaction.category]) {
        expenseCategoryTotals[transaction.category] = { total: 0, count: 0 };
      }
      expenseCategoryTotals[transaction.category].total += transaction.amount;
      expenseCategoryTotals[transaction.category].count += 1;
    });

    return Object.entries(expenseCategoryTotals)
      .map(([categoryName, data]) => {
        const category = getCategoryById(
          Object.values(getCategoryById).find(cat => cat?.name === categoryName)?.id || ''
        );
        return {
          name: categoryName,
          value: data.total,
          count: data.count,
          color: category?.color || '#8884d8',
          icon: category?.icon || '💰',
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [transactions]);

  // Monthly spending data
  const monthlyData = useMemo(() => {
    const monthlySpending: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlySpending[monthKey]) {
        monthlySpending[monthKey] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlySpending[monthKey].income += transaction.amount;
      } else {
        monthlySpending[monthKey].expense += transaction.amount;
      }
    });

    return Object.entries(monthlySpending)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, [transactions]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-card-border">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Insights into your spending patterns</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card card-success p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-income" />
              <span className="text-sm text-muted-foreground">Total Income</span>
            </div>
            <p className="text-lg font-bold text-income">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="glass-card card-expense p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-expense" />
              <span className="text-sm text-muted-foreground">Total Expense</span>
            </div>
            <p className="text-lg font-bold text-expense">{formatCurrency(totalExpense)}</p>
          </div>

          <div className="glass-card p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Savings Rate</span>
            </div>
            <p className="text-lg font-bold text-primary">
              {totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%
            </p>
          </div>

          <div className="glass-card p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Transactions</span>
            </div>
            <p className="text-lg font-bold text-foreground">{transactions.length}</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="glass-card p-8 rounded-lg text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No data to analyze</h3>
            <p className="text-muted-foreground">
              Add some transactions to see your spending analytics.
            </p>
          </div>
        ) : (
          <>
            {/* Category Breakdown */}
            {categoryData.length > 0 && (
              <div className="glass-card p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Amount']}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-3">
                    {categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.icon} {item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(item.value)}</p>
                          <p className="text-xs text-muted-foreground">{item.count} transactions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Trends */}
            {monthlyData.length > 0 && (
              <div className="glass-card p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrency(value), 
                          name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Net'
                        ]}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
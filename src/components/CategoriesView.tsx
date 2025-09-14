import React, { useState, useMemo } from 'react';
import { useExpense } from '@/contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Search, 
  Tag, 
  TrendingUp, 
  TrendingDown, 
  Grid3X3,
  Package,
  DollarSign
} from 'lucide-react';
import { defaultCategories } from '@/constants/categories';
import { cn } from '@/lib/utils';

interface CategoriesViewProps {
  onClose: () => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({ onClose }) => {
  const { transactions, getCategoryTotals } = useExpense();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const categoryTotals = getCategoryTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredCategories = useMemo(() => {
    let categories = defaultCategories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || 
        category.type === filterType || 
        category.type === 'both';
      
      return matchesSearch && matchesType;
    });

    // Sort by usage (categories with transactions first, then alphabetically)
    return categories.sort((a, b) => {
      const aHasTransactions = categoryTotals[a.name] ? 1 : 0;
      const bHasTransactions = categoryTotals[b.name] ? 1 : 0;
      
      if (aHasTransactions !== bHasTransactions) {
        return bHasTransactions - aHasTransactions;
      }
      
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, filterType, categoryTotals]);

  const getUsageStats = () => {
    const totalCategories = defaultCategories.length;
    const usedCategories = Object.keys(categoryTotals).length;
    const totalTransactions = transactions.length;
    
    return {
      totalCategories,
      usedCategories,
      totalTransactions,
      unusedCategories: totalCategories - usedCategories
    };
  };

  const stats = getUsageStats();

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            Categories
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage and organize your transaction categories
          </p>
        </div>
        <Button onClick={onClose} variant="outline" size="sm" className="w-full sm:w-auto">
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6">
        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {stats.totalCategories}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Categories</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-income">
              {stats.usedCategories}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Categories Used</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-muted-foreground">
              {stats.unusedCategories}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Unused</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-accent">
              {stats.totalTransactions}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filter Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize"
                >
                  {type === 'all' ? 'All' : type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.map((category) => {
          const categoryData = categoryTotals[category.name];
          const isUsed = !!categoryData;

          return (
            <Card 
              key={category.id} 
              className={cn(
                "glass-card transition-all duration-200",
                isUsed ? "border-primary/20 hover:border-primary/40" : "opacity-75"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{category.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={category.type === 'income' ? 'default' : 
                               category.type === 'expense' ? 'destructive' : 'secondary'} 
                        className="text-xs"
                      >
                        {category.type === 'income' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {category.type === 'expense' && <TrendingDown className="w-3 h-3 mr-1" />}
                        {category.type === 'both' && <Package className="w-3 h-3 mr-1" />}
                        {category.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {isUsed ? (
                  <div className="space-y-2 pt-3 border-t border-card-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium text-primary">
                        {formatCurrency(categoryData.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transactions:</span>
                      <Badge variant="outline" className="text-xs">
                        {categoryData.count}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-card-border text-center">
                    <p className="text-sm text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No categories found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoriesView;
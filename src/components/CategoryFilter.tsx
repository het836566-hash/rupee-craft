import React from 'react';
import { useExpense } from '@/contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const { getAllCategories } = useExpense();
  const categories = getAllCategories();

  const selectedCategoryData = selectedCategory 
    ? categories.find(cat => cat.name === selectedCategory)
    : null;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedCategory || 'all'}
        onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[200px] glass-card border-card-border bg-background/50">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <SelectValue placeholder="All Categories">
              {selectedCategoryData ? (
                <div className="flex items-center gap-2">
                  <span>{selectedCategoryData.icon}</span>
                  <span className="truncate">{selectedCategoryData.name}</span>
                </div>
              ) : (
                <span>All Categories</span>
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="glass-card border-card-border bg-background/95 backdrop-blur-md max-h-[300px]">
          <SelectItem value="all" className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span>All Categories</span>
            </div>
          </SelectItem>
          {categories.map((category) => (
            <SelectItem 
              key={category.id} 
              value={category.name}
              className={cn(
                "cursor-pointer",
                category.type === 'income' ? "hover:bg-income/10" : "hover:bg-expense/10"
              )}
            >
              <div className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span className="truncate">{category.name}</span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  category.type === 'income' 
                    ? "bg-income/20 text-income" 
                    : "bg-expense/20 text-expense"
                )}>
                  {category.type}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedCategory && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="h-8 w-8 p-0 hover:bg-destructive/10"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default CategoryFilter;
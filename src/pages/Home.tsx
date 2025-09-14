import React, { useState, useMemo } from 'react';
import { useExpense } from '@/contexts/ExpenseContext';
import BalanceSummary from '@/components/BalanceSummary';
import TransactionList from '@/components/TransactionList';
import SearchBar from '@/components/SearchBar';
import DateFilter from '@/components/DateFilter';
import CategoryFilter from '@/components/CategoryFilter';
import { DateFilter as DateFilterType } from '@/types/expense';

const Home: React.FC = () => {
  const { transactions, searchTransactions, filterTransactionsByDate } = useExpense();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>({ type: 'all' });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter transactions based on search, date, and category
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply date filter
    if (dateFilter.type !== 'all') {
      filtered = filterTransactionsByDate(dateFilter.startDate, dateFilter.endDate);
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(transaction => 
        transaction.category === selectedCategory
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(transaction =>
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.amount.toString().includes(searchQuery)
      );
    }

    return filtered;
  }, [transactions, searchQuery, dateFilter, selectedCategory, filterTransactionsByDate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-card-border">
        <div className="p-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Rupee Refine
            </h1>
            <p className="text-muted-foreground mt-1">Your Personal Finance Tracker</p>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <BalanceSummary />

      {/* Search and Filter Controls */}
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by category, note, or amount..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            <DateFilter
              currentFilter={dateFilter}
              onFilterChange={setDateFilter}
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {searchQuery || dateFilter.type !== 'all' || selectedCategory ? 'Filtered ' : ''}Transactions
            {selectedCategory && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                in {selectedCategory}
              </span>
            )}
          </h3>
          <span className="text-sm text-muted-foreground">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="p-4">
        <TransactionList transactions={filteredTransactions} />
      </div>
    </div>
  );
};

export default Home;
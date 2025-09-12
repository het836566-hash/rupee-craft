import React, { useState } from 'react';
import { CalendarDays, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateFilter as DateFilterType } from '@/types/expense';

interface DateFilterProps {
  onFilterChange: (filter: DateFilterType) => void;
  currentFilter: DateFilterType;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, currentFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(currentFilter.startDate || '');
  const [endDate, setEndDate] = useState(currentFilter.endDate || '');

  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const handleFilterSelect = (type: DateFilterType['type']) => {
    const today = new Date();
    let filter: DateFilterType = { type };

    switch (type) {
      case 'today':
        filter.startDate = today.toISOString().split('T')[0];
        filter.endDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        filter.startDate = weekStart.toISOString().split('T')[0];
        filter.endDate = weekEnd.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filter.startDate = monthStart.toISOString().split('T')[0];
        filter.endDate = monthEnd.toISOString().split('T')[0];
        break;
      case 'custom':
        filter.startDate = startDate;
        filter.endDate = endDate;
        break;
    }

    onFilterChange(filter);
    if (type !== 'custom') {
      setIsOpen(false);
    }
  };

  const applyCustomRange = () => {
    onFilterChange({
      type: 'custom',
      startDate,
      endDate,
    });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="glass-card border-card-border">
          <Filter className="w-4 h-4 mr-2" />
          {currentFilter.type === 'all' && 'All Time'}
          {currentFilter.type === 'today' && 'Today'}
          {currentFilter.type === 'week' && 'This Week'}
          {currentFilter.type === 'month' && 'This Month'}
          {currentFilter.type === 'custom' && 'Custom Range'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-card border-card-border">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Filter by Date</h4>
          
          <div className="space-y-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={currentFilter.type === option.value ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleFilterSelect(option.value as DateFilterType['type'])}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {currentFilter.type === 'custom' && (
            <div className="space-y-3 pt-3 border-t border-card-border">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-card border-card-border"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-card border-card-border"
                />
              </div>
              
              <Button 
                onClick={applyCustomRange}
                className="w-full btn-primary-glass"
                disabled={!startDate || !endDate}
              >
                Apply Range
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateFilter;
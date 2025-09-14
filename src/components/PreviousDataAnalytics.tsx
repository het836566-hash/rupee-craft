import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Upload, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  PieChart,
  BarChart3,
  Info,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/expense';
import { 
  PieChart as RechartsPieChart, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend,
  LineChart,
  Line,
  Pie
} from 'recharts';
import { defaultCategories } from '@/constants/categories';

interface FileData {
  id: string;
  name: string;
  transactions: Transaction[];
  uploadDate: Date;
  stats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
    dateRange: string;
  };
}

interface PreviousDataAnalyticsProps {
  onClose: () => void;
  currentTransactions: Transaction[];
}

const PreviousDataAnalytics: React.FC<PreviousDataAnalyticsProps> = ({
  onClose,
  currentTransactions
}) => {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [compareMode, setCompareMode] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateStats = (transactions: Transaction[]) => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    const dates = transactions.map(t => new Date(t.date)).sort();
    const dateRange = dates.length > 0 
      ? `${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}`
      : 'No transactions';

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
      dateRange
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (data.transactions && Array.isArray(data.transactions)) {
            const validTransactions = data.transactions.filter((t: any) => 
              t.id && t.type && t.amount && t.category && t.date
            );

            if (validTransactions.length > 0) {
              const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const newFileData: FileData = {
                id: fileId,
                name: file.name,
                transactions: validTransactions,
                uploadDate: new Date(),
                stats: calculateStats(validTransactions)
              };

              setUploadedFiles(prev => [...prev, newFileData]);
              
              if (activeTab === '') {
                setActiveTab(fileId);
              }

              toast({
                title: "File uploaded successfully",
                description: `Loaded ${validTransactions.length} transactions from ${file.name}`,
              });
            } else {
              throw new Error('No valid transactions found');
            }
          } else {
            throw new Error('Invalid file format');
          }
        } catch (error) {
          toast({
            title: "Upload failed",
            description: `Could not read ${file.name}. Please check the file format.`,
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    });

    // Clear the input
    event.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeTab === fileId) {
      setActiveTab(uploadedFiles.length > 1 ? uploadedFiles.find(f => f.id !== fileId)?.id || '' : '');
    }
  };

  const currentStats = useMemo(() => calculateStats(currentTransactions), [currentTransactions]);

  const getCategoryData = (transactions: Transaction[]) => {
    const categoryTotals: Record<string, { total: number; count: number; color: string; type: 'income' | 'expense' }> = {};

    transactions.forEach(transaction => {
      const category = defaultCategories.find(cat => cat.name === transaction.category);
      if (category) {
        if (!categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] = { 
            total: 0, 
            count: 0, 
            color: category.color,
            type: transaction.type
          };
        }
        categoryTotals[transaction.category].total += transaction.amount;
        categoryTotals[transaction.category].count += 1;
      }
    });

    return Object.entries(categoryTotals)
      .map(([category, data]) => ({
        name: category,
        value: data.total,
        count: data.count,
        color: data.color,
        type: data.type
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getMonthlyData = (transactions: Transaction[]) => {
    const monthlyTotals: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { income: 0, expense: 0 };
      }

      if (transaction.type === 'income') {
        monthlyTotals[monthKey].income += transaction.amount;
      } else {
        monthlyTotals[monthKey].expense += transaction.amount;
      }
    });

    return Object.entries(monthlyTotals)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const activeFileData = uploadedFiles.find(f => f.id === activeTab);

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Previous Data Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Analyze historical transaction data with detailed insights
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <Switch
              id="compare-mode"
              checked={compareMode}
              onCheckedChange={setCompareMode}
              disabled={uploadedFiles.length === 0}
            />
            <Label htmlFor="compare-mode" className="text-sm">Compare with current data</Label>
          </div>
          <Button onClick={onClose} variant="outline" size="sm" className="w-full sm:w-auto">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      {/* File Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Data Files
          </CardTitle>
          <CardDescription>
            Upload JSON backup files to analyze your historical transaction data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept=".json"
              multiple
              onChange={handleFileUpload}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files:</Label>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map(file => (
                    <Badge
                      key={file.id}
                      variant={activeTab === file.id ? "default" : "secondary"}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{file.name}</span>
                      <span className="text-xs">({file.stats.transactionCount})</span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="ml-2 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Content */}
      {uploadedFiles.length === 0 ? (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            Upload one or more JSON backup files to start analyzing your historical data.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            {uploadedFiles.map(file => (
              <TabsTrigger key={file.id} value={file.id}>
                {file.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {uploadedFiles.map(file => (
            <TabsContent key={file.id} value={file.id} className="space-y-6">
              {/* Statistics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-income">
                      {formatCurrency(file.stats.totalIncome)}
                    </div>
                    {compareMode && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Current: {formatCurrency(currentStats.totalIncome)}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-expense">
                      {formatCurrency(file.stats.totalExpense)}
                    </div>
                    {compareMode && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Current: {formatCurrency(currentStats.totalExpense)}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${file.stats.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                      {formatCurrency(file.stats.balance)}
                    </div>
                    {compareMode && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Current: {formatCurrency(currentStats.balance)}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {file.stats.transactionCount}
                    </div>
                    {compareMode && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Current: {currentStats.transactionCount}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Category Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={getCategoryData(file.transactions).slice(0, 8)}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => 
                              percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                            }
                          >
                            {getCategoryData(file.transactions).slice(0, 8).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), 'Amount']}
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#ffffff'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Monthly Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getMonthlyData(file.transactions)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis 
                            dataKey="month" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip 
                            formatter={(value: number, name: string) => [
                              formatCurrency(value), 
                              name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Net'
                            ]}
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#ffffff'
                            }}
                          />
                          <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* File Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    File Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>File Name:</strong> {file.name}
                    </div>
                    <div>
                      <strong>Upload Date:</strong> {file.uploadDate.toLocaleString()}
                    </div>
                    <div>
                      <strong>Date Range:</strong> {file.stats.dateRange}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default PreviousDataAnalytics;
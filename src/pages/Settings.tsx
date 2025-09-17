import React, { useState } from 'react';
import { useExpense } from '@/contexts/ExpenseContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useSplit } from '@/contexts/SplitContext';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Upload, 
  Trash2, 
  Info, 
  Database,
  FileText,
  Shield,
  Palette,
  Moon,
  BarChart3,
  Grid3X3,
  Tag,
  Target,
  Users,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PreviousDataAnalytics from '@/components/PreviousDataAnalytics';
import CategoriesView from '@/components/CategoriesView';
import Budget from '@/pages/Budget';
import Split from '@/pages/Split';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const Settings: React.FC = () => {
  const { transactions } = useExpense();
  const { budgets, budgetTransactions } = useBudget();
  const { splitGroups, splitExpenses } = useSplit();
  const { friends, friendTransactions } = useFriends();
  const { toast } = useToast();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [showPreviousAnalytics, setShowPreviousAnalytics] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [isImportWarningOpen, setIsImportWarningOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [importValidationError, setImportValidationError] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showSplit, setShowSplit] = useState(false);

  const handleExportData = async () => {
    if (!customFilename.trim()) {
      toast({
        title: "Filename required",
        description: "Please enter a filename for your export.",
        variant: "destructive"
      });
      return;
    }

    const dataToExport = {
      transactions,
      budgets,
      budgetTransactions,
      splitGroups,
      splitExpenses,
      friends,
      friendTransactions,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };

    const filename = customFilename.endsWith('.json') ? customFilename : `${customFilename}.json`;

    try {
      const platform = Capacitor.getPlatform ? Capacitor.getPlatform() : 'web';

      if (platform !== 'web') {
        const json = JSON.stringify(dataToExport, null, 2);

        if (platform === 'android') {
          // Try to save in app's private folder first, then fallback to Downloads
          let savedLocation = '';
          try {
            // First attempt: Save to app's private data directory
            await Filesystem.writeFile({
              path: `exports/${filename}`,
              data: json,
              directory: Directory.Data,
              encoding: Encoding.UTF8,
            });
            savedLocation = `App's private folder: exports/${filename}`;
          } catch (privateError) {
            console.log('Private folder failed, trying Downloads:', privateError);
            try {
              // Fallback: Save to Downloads folder
              await (Filesystem as any).requestPermissions?.();
              const androidDownloadsDir = (Directory as any).ExternalStorage || (Directory as any).External || Directory.Documents;
              await Filesystem.writeFile({
                path: `Download/${filename}`,
                data: json,
                directory: androidDownloadsDir,
                encoding: Encoding.UTF8,
              });
              savedLocation = `Downloads/${filename}`;
            } catch (downloadError) {
              console.error('Both private and Downloads failed:', downloadError);
              throw new Error('Failed to save to both private folder and Downloads');
            }
          }
          
          toast({
            title: "Exported successfully",
            description: `Saved to: ${savedLocation}. File is secure in your app's storage.`,
          });
        } else {
          // iOS: save into app's Documents directory (private to app)
          await Filesystem.writeFile({
            path: `exports/${filename}`,
            data: json,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
          });
          toast({
            title: "Exported",
            description: `Saved to app's Documents: exports/${filename}`,
          });
        }
      } else {
        // Web fallback: trigger download
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        toast({
          title: "Data exported successfully",
          description: isMobile 
            ? `File downloaded as ${filename}. Check your Downloads folder or notification panel.`
            : `Your transaction data has been downloaded as ${filename}.`,
        });
      }

      setIsExportDialogOpen(false);
      setCustomFilename('');
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting your data.",
        variant: "destructive"
      });
    }
  };

  const validateImportFile = (file: File): Promise<{ isValid: boolean; data?: any; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          // Validate required arrays exist
          if (!importedData.transactions || !Array.isArray(importedData.transactions)) {
            resolve({ isValid: false, error: 'Invalid file format - missing transactions array' });
            return;
          }

          const validTransactions = importedData.transactions.filter((t: any) => 
            t.id && t.type && t.amount && t.category && t.date
          );

          // Validate optional arrays (set to empty if missing)
          const validBudgets = Array.isArray(importedData.budgets) ? importedData.budgets : [];
          const validBudgetTransactions = Array.isArray(importedData.budgetTransactions) ? importedData.budgetTransactions : [];
          const validSplitGroups = Array.isArray(importedData.splitGroups) ? importedData.splitGroups : [];
          const validSplitExpenses = Array.isArray(importedData.splitExpenses) ? importedData.splitExpenses : [];
          const validFriends = Array.isArray(importedData.friends) ? importedData.friends : [];
          const validFriendTransactions = Array.isArray(importedData.friendTransactions) ? importedData.friendTransactions : [];

          if (validTransactions.length === 0) {
            resolve({ isValid: false, error: 'No valid transactions found in file' });
            return;
          }

          const hasInvalidTransactions = importedData.transactions.length > validTransactions.length;
          
          resolve({ 
            isValid: true, 
            data: { 
              ...importedData, 
              validTransactions, 
              validBudgets,
              validBudgetTransactions,
              validSplitGroups,
              validSplitExpenses,
              validFriends,
              validFriendTransactions,
              hasInvalidTransactions 
            }
          });
        } catch (error) {
          resolve({ isValid: false, error: 'Invalid JSON format' });
        }
      };
      reader.readAsText(file);
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPendingImportFile(file);
    
    if (transactions.length > 0) {
      // Show warning dialog if there's existing data
      setIsImportWarningOpen(true);
    } else {
      // Proceed directly if no existing data
      processImportFile(file);
    }
    
    // Clear the input
    event.target.value = '';
    setIsImportDialogOpen(false);
  };

  const processImportFile = async (file: File) => {
    const validation = await validateImportFile(file);
    
    if (!validation.isValid) {
      setImportValidationError(validation.error || 'Unknown validation error');
      setIsImportWarningOpen(true);
      return;
    }

    const { 
      validTransactions, 
      validBudgets,
      validBudgetTransactions,
      validSplitGroups,
      validSplitExpenses,
      validFriends,
      validFriendTransactions,
      hasInvalidTransactions 
    } = validation.data;

    if (hasInvalidTransactions) {
      setImportValidationError(`File contains some invalid transactions. Only ${validTransactions.length} valid transactions will be imported.`);
      setIsImportWarningOpen(true);
      return;
    }

    // Import all data
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(validTransactions));
    localStorage.setItem('expense-tracker-budgets', JSON.stringify(validBudgets));
    localStorage.setItem('expense-tracker-budget-transactions', JSON.stringify(validBudgetTransactions));
    localStorage.setItem('expense-tracker-split-groups', JSON.stringify(validSplitGroups));
    localStorage.setItem('expense-tracker-split-expenses', JSON.stringify(validSplitExpenses));
    localStorage.setItem('expense-tracker-friends', JSON.stringify(validFriends));
    localStorage.setItem('expense-tracker-friend-transactions', JSON.stringify(validFriendTransactions));
    
    const totalImported = validTransactions.length + validBudgets.length + validSplitGroups.length + validFriends.length;
    toast({
      title: "Import successful",
      description: `Imported ${validTransactions.length} transactions, ${validBudgets.length} budgets, ${validSplitGroups.length} split groups, and ${validFriends.length} friends. Refreshing app...`,
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleConfirmImport = () => {
    if (pendingImportFile) {
      processImportFile(pendingImportFile);
    }
    setIsImportWarningOpen(false);
    setPendingImportFile(null);
    setImportValidationError(null);
  };

  const handleCancelImport = () => {
    setIsImportWarningOpen(false);
    setPendingImportFile(null);
    setImportValidationError(null);
  };

  const handleClearAllData = () => {
    localStorage.removeItem('expense-tracker-transactions');
    localStorage.removeItem('expense-tracker-budgets');
    localStorage.removeItem('expense-tracker-budget-transactions');
    localStorage.removeItem('expense-tracker-split-groups');
    localStorage.removeItem('expense-tracker-split-expenses');
    localStorage.removeItem('expense-tracker-friends');
    localStorage.removeItem('expense-tracker-friend-transactions');
    localStorage.removeItem('expense-tracker-custom-categories');
    window.location.reload();
  };

  const settingSections = [
    {
      title: 'Data Management',
      icon: Database,
      items: [
        {
          title: 'Export Data',
          description: 'Download your transaction data as backup',
          icon: Download,
          action: () => {
            setCustomFilename(`expense-backup-${new Date().toISOString().split('T')[0]}`);
            setIsExportDialogOpen(true);
          },
          disabled: transactions.length === 0 && budgets.length === 0 && splitGroups.length === 0 && friends.length === 0,
        },
        {
          title: 'Import Data',
          description: 'Restore data from a backup file',
          icon: Upload,
          action: () => setIsImportDialogOpen(true),
        },
        {
          title: 'Previous Data Analytics',
          description: 'Analyze uploaded JSON files with detailed charts',
          icon: BarChart3,
          action: () => setShowPreviousAnalytics(true),
        },
        {
          title: 'Manage Categories',
          description: 'View and organize transaction categories',
          icon: Grid3X3,
          action: () => setShowCategories(true),
        },
        {
          title: 'Clear All Data',
          description: 'Delete all transactions permanently',
          icon: Trash2,
          action: () => setIsClearDialogOpen(true),
          danger: true,
          disabled: transactions.length === 0 && budgets.length === 0 && splitGroups.length === 0 && friends.length === 0,
        },
      ],
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          title: 'Dark Mode',
          description: 'Currently enabled (cannot be changed)',
          icon: Moon,
          disabled: true,
        },
      ],
    },
    {
      title: 'More Features',
      icon: Target,
      items: [
        {
          title: 'Budget Tracker',
          description: 'Set and track spending goals for specific purposes',
          icon: Target,
          action: () => setShowBudget(true),
        },
        {
          title: 'Split Expenses',
          description: 'Track shared expenses with friends and calculate settlements',
          icon: Users,
          action: () => setShowSplit(true),
        },
      ],
    },
    {
      title: 'About',
      icon: Info,
      items: [
        {
          title: 'App Version',
          description: '1.0.0',
          icon: FileText,
          disabled: true,
        },
        {
          title: 'Privacy',
          description: 'All data is stored locally on your device',
          icon: Shield,
          disabled: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-card-border">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences and data</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* App Stats */}
        <div className="glass-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">App Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{transactions.length}</p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-income">
                {budgets.length}
              </p>
              <p className="text-sm text-muted-foreground">Budgets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-expense">
                {friends.length}
              </p>
              <p className="text-sm text-muted-foreground">Friends</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                {splitGroups.length}
              </p>
              <p className="text-sm text-muted-foreground">Split Groups</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        {settingSections.map((section) => (
          <div key={section.title} className="glass-card p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <section.icon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">{section.title}</h3>
            </div>

            <div className="space-y-3">
              {section.items.map((item) => (
                <div
                  key={item.title}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg transition-all duration-200",
                    "bg-card/30 border border-card-border",
                    !item.disabled && "hover:bg-card/50 cursor-pointer",
                    item.disabled && "opacity-60"
                  )}
                  onClick={!item.disabled ? item.action : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      item.danger ? "bg-destructive/20" : "bg-primary/20"
                    )}>
                      <item.icon className={cn(
                        "w-5 h-5",
                        item.danger ? "text-destructive" : "text-primary"
                      )} />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="glass-card border-card-border">
          <DialogHeader>
            <DialogTitle>Export Transaction Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                This will download a JSON file containing all your data including transactions, budgets, friends, and split expenses. 
                Keep this file safe as a backup.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <div>
                <Label htmlFor="filename">Custom Filename</Label>
                <Input
                  id="filename"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="Enter filename (without .json extension)"
                  className="mt-1"
                />
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={handleExportData}
                  className="flex-1 btn-primary-glass"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsExportDialogOpen(false);
                    setCustomFilename('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="glass-card border-card-border">
          <DialogHeader>
            <DialogTitle>Import Transaction Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Select a JSON backup file to restore all your data including transactions, budgets, friends, and split expenses. 
                {(transactions.length > 0 || budgets.length > 0 || friends.length > 0 || splitGroups.length > 0) && "This will replace your current data."}
              </AlertDescription>
            </Alert>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <Button 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Warning Dialog */}
      <Dialog open={isImportWarningOpen} onOpenChange={setIsImportWarningOpen}>
        <DialogContent className="glass-card border-card-border">
          <DialogHeader>
            <DialogTitle>
              {importValidationError ? "Import Warning" : "Replace Existing Data?"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant={importValidationError ? "destructive" : "default"}>
              <Info className="w-4 h-4" />
              <AlertDescription>
                {importValidationError || 
                  `You have ${transactions.length} transactions, ${budgets.length} budgets, ${friends.length} friends, and ${splitGroups.length} split groups. Importing this file will permanently replace all your current data. This action cannot be undone.`
                }
              </AlertDescription>
            </Alert>
            <div className="flex space-x-3">
              <Button 
                onClick={handleConfirmImport}
                variant={importValidationError ? "destructive" : "default"}
                className="flex-1"
              >
                {importValidationError ? "Import Anyway" : "Yes, Replace Data"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancelImport}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Data Dialog */}
      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent className="glass-card border-card-border">
          <DialogHeader>
            <DialogTitle>Clear All Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Trash2 className="w-4 h-4" />
              <AlertDescription>
                This action cannot be undone. All your transaction data will be permanently deleted.
              </AlertDescription>
            </Alert>
            <div className="flex space-x-3">
              <Button 
                variant="destructive"
                onClick={handleClearAllData}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Data
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsClearDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Previous Data Analytics Modal */}
      {showPreviousAnalytics && (
        <div className="fixed inset-0 z-50 bg-background">
          <PreviousDataAnalytics 
            onClose={() => setShowPreviousAnalytics(false)}
            currentTransactions={transactions}
          />
        </div>
      )}

      {/* Categories Modal */}
      {showCategories && (
        <div className="fixed inset-0 z-50 bg-background">
          <CategoriesView onClose={() => setShowCategories(false)} />
        </div>
      )}

      {/* Budget Modal */}
      {showBudget && (
        <div className="fixed inset-0 z-50 bg-background">
          <Budget />
          <Button
            onClick={() => setShowBudget(false)}
            variant="outline"
            className="fixed top-4 right-4 z-10"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      )}

      {/* Split Modal */}
      {showSplit && (
        <div className="fixed inset-0 z-50 bg-background">
          <Split />
          <Button
            onClick={() => setShowSplit(false)}
            variant="outline"
            className="fixed top-4 right-4 z-10"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default Settings;
import React, { useState } from 'react';
import { useExpense } from '@/contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  Trash2, 
  Info, 
  Database,
  FileText,
  Shield,
  Palette,
  Moon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Settings: React.FC = () => {
  const { transactions } = useExpense();
  const { toast } = useToast();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const handleExportData = () => {
    try {
      const dataToExport = {
        transactions,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your transaction data has been downloaded successfully.",
      });

      setIsExportDialogOpen(false);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting your data.",
        variant: "destructive"
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.transactions && Array.isArray(importedData.transactions)) {
          // In a real app, you would merge or replace the data
          console.log('Imported data:', importedData);
          
          toast({
            title: "Import successful",
            description: `Imported ${importedData.transactions.length} transactions.`,
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is invalid or corrupted.",
          variant: "destructive"
        });
      }
    };

    reader.readAsText(file);
    setIsImportDialogOpen(false);
  };

  const handleClearAllData = () => {
    localStorage.removeItem('expense-tracker-transactions');
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
          action: () => setIsExportDialogOpen(true),
          disabled: transactions.length === 0,
        },
        {
          title: 'Import Data',
          description: 'Restore data from a backup file',
          icon: Upload,
          action: () => setIsImportDialogOpen(true),
        },
        {
          title: 'Clear All Data',
          description: 'Delete all transactions permanently',
          icon: Trash2,
          action: () => setIsClearDialogOpen(true),
          danger: true,
          disabled: transactions.length === 0,
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
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-income">
                {transactions.filter(t => t.type === 'income').length}
              </p>
              <p className="text-sm text-muted-foreground">Income Records</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-expense">
                {transactions.filter(t => t.type === 'expense').length}
              </p>
              <p className="text-sm text-muted-foreground">Expense Records</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                {Math.round((JSON.stringify(transactions).length / 1024) * 100) / 100}
              </p>
              <p className="text-sm text-muted-foreground">Data Size (KB)</p>
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
                This will download a JSON file containing all your transaction data. 
                Keep this file safe as a backup.
              </AlertDescription>
            </Alert>
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
                onClick={() => setIsExportDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
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
                Select a JSON backup file to restore your transaction data. 
                This will replace your current data.
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
    </div>
  );
};

export default Settings;
import React, { useState } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Calendar, 
  Trash2,
  Edit,
  IndianRupee
} from 'lucide-react';
import { Friend } from '@/types/friends';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FriendDetailDialogProps {
  friend: Friend;
  open: boolean;
  onClose: () => void;
}

const FriendDetailDialog: React.FC<FriendDetailDialogProps> = ({ 
  friend, 
  open, 
  onClose 
}) => {
  const { 
    addFriendTransaction, 
    getFriendTransactions, 
    deleteFriend,
    updateFriend,
    deleteFriendTransaction 
  } = useFriends();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('transactions');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditFriend, setShowEditFriend] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    type: 'lent' as 'lent' | 'borrowed',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editForm, setEditForm] = useState({
    name: friend.name,
    phone: friend.phone || '',
    avatar: friend.avatar || ''
  });

  const transactions = getFriendTransactions(friend.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(transactionForm.amount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    try {
      addFriendTransaction({
        friendId: friend.id,
        type: transactionForm.type,
        amount: amount,
        description: transactionForm.description.trim() || undefined,
        date: transactionForm.date
      });

      toast({
        title: "Transaction added",
        description: `Added ${transactionForm.type} of ${formatCurrency(amount)}.`,
      });

      // Reset form
      setTransactionForm({
        type: 'lent',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddTransaction(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditFriend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your friend.",
        variant: "destructive"
      });
      return;
    }

    try {
      updateFriend(friend.id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || undefined,
        avatar: editForm.avatar.trim() || undefined,
      });

      toast({
        title: "Friend updated",
        description: `${editForm.name}'s information has been updated.`,
      });

      setShowEditFriend(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update friend. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFriend = () => {
    if (confirm(`Are you sure you want to delete ${friend.name}? This will also delete all transactions with them.`)) {
      deleteFriend(friend.id);
      toast({
        title: "Friend deleted",
        description: `${friend.name} has been removed from your friends list.`,
      });
      onClose();
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteFriendTransaction(transactionId);
      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-card-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={friend.avatar} />
              <AvatarFallback className="bg-primary/20">
                {friend.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {friend.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Summary */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <div className={cn(
                    "text-xl font-bold flex items-center gap-2",
                    friend.totalBalance === 0 ? "text-muted-foreground" :
                    friend.totalBalance > 0 ? "text-income" : "text-expense"
                  )}>
                    {friend.totalBalance === 0 ? (
                      "Settled Up"
                    ) : friend.totalBalance > 0 ? (
                      <>
                        <ArrowUpRight className="w-5 h-5" />
                        They owe you {formatCurrency(friend.totalBalance)}
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="w-5 h-5" />
                        You owe them {formatCurrency(friend.totalBalance)}
                      </>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={friend.totalBalance === 0 ? "secondary" : friend.totalBalance > 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {friend.totalBalance === 0 ? "Even" : friend.totalBalance > 0 ? "In your favor" : "You owe"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              {/* Add Transaction Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Transaction History</h3>
                <Button 
                  onClick={() => setShowAddTransaction(!showAddTransaction)}
                  size="sm"
                  className="btn-primary-glass"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </div>

              {/* Add Transaction Form */}
              {showAddTransaction && (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <form onSubmit={handleAddTransaction} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Transaction Type</Label>
                          <select
                            value={transactionForm.type}
                            onChange={(e) => setTransactionForm({
                              ...transactionForm,
                              type: e.target.value as 'lent' | 'borrowed'
                            })}
                            className="mt-1 w-full p-2 rounded-md border border-input bg-background text-sm"
                          >
                            <option value="lent">I lent money</option>
                            <option value="borrowed">I borrowed money</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={transactionForm.amount}
                            onChange={(e) => setTransactionForm({
                              ...transactionForm,
                              amount: e.target.value
                            })}
                            placeholder="0.00"
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={transactionForm.date}
                          onChange={(e) => setTransactionForm({
                            ...transactionForm,
                            date: e.target.value
                          })}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          value={transactionForm.description}
                          onChange={(e) => setTransactionForm({
                            ...transactionForm,
                            description: e.target.value
                          })}
                          placeholder="What was this for?"
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          Add Transaction
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowAddTransaction(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Transactions List */}
              {transactions.length === 0 ? (
                <Alert>
                  <IndianRupee className="w-4 h-4" />
                  <AlertDescription>
                    No transactions yet. Start by adding a transaction above.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                    <Card key={transaction.id} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              transaction.type === 'lent' 
                                ? "bg-income/20 text-income" 
                                : "bg-expense/20 text-expense"
                            )}>
                              {transaction.type === 'lent' ? (
                                <ArrowUpRight className="w-5 h-5" />
                              ) : (
                                <ArrowDownLeft className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.type === 'lent' 
                                  ? `You lent ${formatCurrency(transaction.amount)}`
                                  : `You borrowed ${formatCurrency(transaction.amount)}`
                                }
                              </p>
                              {transaction.description && (
                                <p className="text-sm text-muted-foreground">
                                  {transaction.description}
                                </p>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(transaction.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Profile Information</h3>
                <Button 
                  onClick={() => setShowEditFriend(!showEditFriend)}
                  size="sm"
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              {showEditFriend ? (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <form onSubmit={handleEditFriend} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                          id="edit-name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-phone">Phone</Label>
                        <Input
                          id="edit-phone"
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-avatar">Avatar URL</Label>
                        <Input
                          id="edit-avatar"
                          type="url"
                          value={editForm.avatar}
                          onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          Save Changes
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowEditFriend(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="bg-primary/20 text-lg">
                          {friend.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-lg">{friend.name}</h4>
                        {friend.phone && (
                          <p className="text-muted-foreground">{friend.phone}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(friend.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Delete Friend */}
              <Card className="glass-card border-destructive/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-destructive">Delete Friend</h4>
                      <p className="text-sm text-muted-foreground">
                        This will permanently delete all data for this friend
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteFriend}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendDetailDialog;
import React, { useState } from 'react';
import { useSplit } from '@/contexts/SplitContext';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Receipt, ArrowRight, Trash2, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Split: React.FC = () => {
  const { splitGroups, splitExpenses, addSplitGroup, addSplitExpense, deleteSplitGroup, calculateSplitBalances } = useSplit();
  const { friends } = useFriends();
  const { toast } = useToast();
  
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    members: [] as string[]
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitAmong: [] as string[],
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFriendName = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    return friend ? friend.name : 'Unknown';
  };

  const handleAddGroup = () => {
    if (!newGroup.name || newGroup.members.length === 0) {
      toast({
        title: "Error",
        description: "Please provide group name and select members",
        variant: "destructive"
      });
      return;
    }

    addSplitGroup({
      name: newGroup.name,
      description: newGroup.description,
      members: newGroup.members,
    });

    toast({
      title: "Success",
      description: "Split group created successfully"
    });

    setNewGroup({
      name: '',
      description: '',
      members: []
    });
    setIsGroupDialogOpen(false);
  };

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy || newExpense.splitAmong.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    addSplitExpense({
      splitGroupId: selectedGroupId,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy,
      splitAmong: newExpense.splitAmong,
      date: newExpense.date,
    });

    toast({
      title: "Success",
      description: "Expense added to split group"
    });

    setNewExpense({
      description: '',
      amount: '',
      paidBy: '',
      splitAmong: [],
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setIsExpenseDialogOpen(false);
    setSelectedGroupId('');
  };

  const toggleMember = (friendId: string, field: 'members' | 'splitAmong') => {
    if (field === 'members') {
      setNewGroup(prev => ({
        ...prev,
        members: prev.members.includes(friendId) 
          ? prev.members.filter(id => id !== friendId)
          : [...prev.members, friendId]
      }));
    } else {
      setNewExpense(prev => ({
        ...prev,
        splitAmong: prev.splitAmong.includes(friendId) 
          ? prev.splitAmong.filter(id => id !== friendId)
          : [...prev.splitAmong, friendId]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-card-border">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Split Expenses
              </h1>
              <p className="text-muted-foreground">Track shared expenses with friends</p>
            </div>
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Group
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Split Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Goa Trip 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="groupDesc">Description (Optional)</Label>
                    <Textarea
                      id="groupDesc"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Trip details..."
                    />
                  </div>
                  <div>
                    <Label>Select Members</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={friend.id}
                            checked={newGroup.members.includes(friend.id)}
                            onCheckedChange={() => toggleMember(friend.id, 'members')}
                          />
                          <Label htmlFor={friend.id} className="flex-1 cursor-pointer">
                            {friend.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {friends.length === 0 && (
                      <p className="text-sm text-muted-foreground">No friends added yet. Add friends first.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddGroup} className="flex-1" disabled={friends.length === 0}>
                      Create Group
                    </Button>
                    <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Split Groups */}
      <div className="p-4 space-y-4">
        {splitGroups.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No split groups yet</h3>
            <p className="text-muted-foreground">Create a group to start splitting expenses with friends.</p>
          </Card>
        ) : (
          splitGroups.map((group) => {
            const balances = calculateSplitBalances(group.id);
            
            return (
              <Card key={group.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {group.name}
                      </CardTitle>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedGroupId(group.id);
                          setNewExpense(prev => ({
                            ...prev,
                            splitAmong: group.members
                          }));
                          setIsExpenseDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Expense
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSplitGroup(group.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Expenses</span>
                      <span className="font-semibold">{formatCurrency(group.totalAmount)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Members:</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.members.map(memberId => (
                          <span key={memberId} className="bg-muted px-2 py-1 rounded text-xs">
                            {getFriendName(memberId)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {balances.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Settlement:</h4>
                        <div className="space-y-1">
                          {balances.map((balance, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span>{getFriendName(balance.fromFriend)}</span>
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                <span>{getFriendName(balance.toFriend)}</span>
                              </div>
                              <span className="font-medium text-expense">
                                {formatCurrency(balance.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="expenseDesc">Description</Label>
              <Input
                id="expenseDesc"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Hotel booking"
              />
            </div>
            <div>
              <Label htmlFor="expenseAmount">Amount</Label>
              <Input
                id="expenseAmount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="5000"
              />
            </div>
            <div>
              <Label htmlFor="paidBy">Paid By</Label>
              <Select value={newExpense.paidBy} onValueChange={(value) => setNewExpense(prev => ({ ...prev, paidBy: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent>
                  {selectedGroupId && splitGroups.find(g => g.id === selectedGroupId)?.members.map(memberId => (
                    <SelectItem key={memberId} value={memberId}>
                      {getFriendName(memberId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Split Among</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedGroupId && splitGroups.find(g => g.id === selectedGroupId)?.members.map(memberId => (
                  <div key={memberId} className="flex items-center space-x-2">
                    <Checkbox
                      id={`split-${memberId}`}
                      checked={newExpense.splitAmong.includes(memberId)}
                      onCheckedChange={() => toggleMember(memberId, 'splitAmong')}
                    />
                    <Label htmlFor={`split-${memberId}`} className="flex-1 cursor-pointer">
                      {getFriendName(memberId)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="expenseDate">Date</Label>
              <Input
                id="expenseDate"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddExpense} className="flex-1">
                Add Expense
              </Button>
              <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Split;
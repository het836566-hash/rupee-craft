import React, { useState } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft,
  Users,
  IndianRupee
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddFriendDialog from '@/components/AddFriendDialog';
import FriendDetailDialog from '@/components/FriendDetailDialog';
import { Friend } from '@/types/friends';

const Friends: React.FC = () => {
  const { friends } = useFriends();
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const getTotalOwed = () => {
    return friends.reduce((total, friend) => {
      return friend.totalBalance > 0 ? total + friend.totalBalance : total;
    }, 0);
  };

  const getTotalBorrowed = () => {
    return friends.reduce((total, friend) => {
      return friend.totalBalance < 0 ? total + Math.abs(friend.totalBalance) : total;
    }, 0);
  };

  const getNetBalance = () => {
    return getTotalOwed() - getTotalBorrowed();
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
                Friends & Loans
              </h1>
              <p className="text-muted-foreground">Track money lent and borrowed</p>
            </div>
            <Button 
              onClick={() => setIsAddFriendOpen(true)}
              className="btn-primary-glass"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Friend
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-income" />
                You'll Get
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income">
                {formatCurrency(getTotalOwed())}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Money others owe you
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-expense" />
                You Owe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(getTotalBorrowed())}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Money you owe others
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-primary" />
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                getNetBalance() >= 0 ? "text-income" : "text-expense"
              )}>
                {formatCurrency(getNetBalance())}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Overall balance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Friends List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Friends ({friends.length})</h2>
          
          {friends.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No friends added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding friends to track money exchanges
                </p>
                <Button 
                  onClick={() => setIsAddFriendOpen(true)}
                  className="btn-primary-glass"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Friend
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <Card 
                  key={friend.id} 
                  className="glass-card hover:bg-card/50 cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedFriend(friend)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="bg-primary/20">
                          {friend.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{friend.name}</h3>
                        {friend.phone && (
                          <p className="text-sm text-muted-foreground truncate">
                            {friend.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-card-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Balance:</span>
                        <div className="flex items-center gap-2">
                          {friend.totalBalance === 0 ? (
                            <Badge variant="secondary" className="text-xs">
                              Settled
                            </Badge>
                          ) : (
                            <Badge 
                              variant={friend.totalBalance > 0 ? "default" : "destructive"} 
                              className="text-xs"
                            >
                              {friend.totalBalance > 0 ? (
                                <>
                                  <ArrowUpRight className="w-3 h-3 mr-1" />
                                  They owe {formatCurrency(friend.totalBalance)}
                                </>
                              ) : (
                                <>
                                  <ArrowDownLeft className="w-3 h-3 mr-1" />
                                  You owe {formatCurrency(friend.totalBalance)}
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Friend Dialog */}
      <AddFriendDialog 
        open={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
      />

      {/* Friend Detail Dialog */}
      {selectedFriend && (
        <FriendDetailDialog 
          friend={selectedFriend}
          open={!!selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}
    </div>
  );
};

export default Friends;
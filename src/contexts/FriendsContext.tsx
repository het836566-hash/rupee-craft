import React, { createContext, useContext, useState, useEffect } from 'react';
import { Friend, FriendTransaction, FriendsContextType } from '@/types/friends';

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendTransactions, setFriendTransactions] = useState<FriendTransaction[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFriends = localStorage.getItem('expense-tracker-friends');
    const savedTransactions = localStorage.getItem('expense-tracker-friend-transactions');
    
    if (savedFriends) {
      try {
        setFriends(JSON.parse(savedFriends));
      } catch (error) {
        console.error('Error loading friends from localStorage:', error);
      }
    }

    if (savedTransactions) {
      try {
        setFriendTransactions(JSON.parse(savedTransactions));
      } catch (error) {
        console.error('Error loading friend transactions from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('expense-tracker-friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('expense-tracker-friend-transactions', JSON.stringify(friendTransactions));
  }, [friendTransactions]);

  const calculateFriendBalance = (friendId: string): number => {
    return friendTransactions
      .filter(t => t.friendId === friendId)
      .reduce((balance, transaction) => {
        return transaction.type === 'lent' 
          ? balance + transaction.amount  // they owe you
          : balance - transaction.amount; // you owe them
      }, 0);
  };

  const addFriend = (friendData: Omit<Friend, 'id' | 'totalBalance' | 'createdAt'>) => {
    const newFriend: Friend = {
      ...friendData,
      id: Date.now().toString(),
      totalBalance: 0,
      createdAt: new Date().toISOString(),
    };

    setFriends(prev => [...prev, newFriend]);
  };

  const updateFriend = (id: string, updatedFriend: Partial<Friend>) => {
    setFriends(prev => 
      prev.map(friend => 
        friend.id === id ? { ...friend, ...updatedFriend } : friend
      )
    );
  };

  const deleteFriend = (id: string) => {
    setFriends(prev => prev.filter(friend => friend.id !== id));
    setFriendTransactions(prev => prev.filter(transaction => transaction.friendId !== id));
  };

  const addFriendTransaction = (transactionData: Omit<FriendTransaction, 'id' | 'createdAt'>) => {
    const newTransaction: FriendTransaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setFriendTransactions(prev => {
      const updatedTransactions = [...prev, newTransaction];
      
      // Calculate new balance with the updated transactions list
      const newBalance = updatedTransactions
        .filter(t => t.friendId === transactionData.friendId)
        .reduce((balance, transaction) => {
          return transaction.type === 'lent' 
            ? balance + transaction.amount  // they owe you
            : balance - transaction.amount; // you owe them
        }, 0);
      
      // Update friend's balance
      setFriends(prevFriends => 
        prevFriends.map(friend => 
          friend.id === transactionData.friendId 
            ? { ...friend, totalBalance: newBalance }
            : friend
        )
      );
      
      return updatedTransactions;
    });
  };

  const updateFriendTransaction = (id: string, updatedTransaction: Partial<FriendTransaction>) => {
    setFriendTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
      )
    );

    // Recalculate and update friend's balance
    const transaction = friendTransactions.find(t => t.id === id);
    if (transaction) {
      const newBalance = calculateFriendBalance(transaction.friendId);
      updateFriend(transaction.friendId, { totalBalance: newBalance });
    }
  };

  const deleteFriendTransaction = (id: string) => {
    const transaction = friendTransactions.find(t => t.id === id);
    setFriendTransactions(prev => prev.filter(t => t.id !== id));

    // Recalculate and update friend's balance
    if (transaction) {
      const newBalance = calculateFriendBalance(transaction.friendId);
      updateFriend(transaction.friendId, { totalBalance: newBalance });
    }
  };

  const getFriendBalance = (friendId: string): number => {
    return calculateFriendBalance(friendId);
  };

  const getFriendTransactions = (friendId: string): FriendTransaction[] => {
    return friendTransactions.filter(t => t.friendId === friendId);
  };

  const value: FriendsContextType = {
    friends,
    friendTransactions,
    addFriend,
    updateFriend,
    deleteFriend,
    addFriendTransaction,
    updateFriendTransaction,
    deleteFriendTransaction,
    getFriendBalance,
    getFriendTransactions,
  };

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  );
};
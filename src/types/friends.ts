export interface Friend {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  totalBalance: number; // positive means they owe you, negative means you owe them
  createdAt: string;
}

export interface FriendTransaction {
  id: string;
  friendId: string;
  type: 'lent' | 'borrowed'; // lent = you gave money, borrowed = you received money
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
}

export interface FriendsContextType {
  friends: Friend[];
  friendTransactions: FriendTransaction[];
  addFriend: (friend: Omit<Friend, 'id' | 'totalBalance' | 'createdAt'>) => void;
  updateFriend: (id: string, friend: Partial<Friend>) => void;
  deleteFriend: (id: string) => void;
  addFriendTransaction: (transaction: Omit<FriendTransaction, 'id' | 'createdAt'>) => void;
  updateFriendTransaction: (id: string, transaction: Partial<FriendTransaction>) => void;
  deleteFriendTransaction: (id: string) => void;
  getFriendBalance: (friendId: string) => number;
  getFriendTransactions: (friendId: string) => FriendTransaction[];
}
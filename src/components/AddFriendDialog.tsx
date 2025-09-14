import React, { useState } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddFriendDialogProps {
  open: boolean;
  onClose: () => void;
}

// Predefined avatar options
const AVATAR_OPTIONS = [
  { id: 'boy', label: 'Boy', emoji: '👦' },
  { id: 'girl', label: 'Girl', emoji: '👧' }
];

const AddFriendDialog: React.FC<AddFriendDialogProps> = ({ open, onClose }) => {
  const { addFriend } = useFriends();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: 'boy' // Default to boy
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your friend.",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedAvatar = AVATAR_OPTIONS.find(option => option.id === formData.avatar);
      addFriend({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        avatar: selectedAvatar?.emoji || '👦',
      });

      toast({
        title: "Friend added",
        description: `${formData.name} has been added to your friends list.`,
      });

      // Reset form and close dialog
      setFormData({ name: '', phone: '', avatar: 'boy' });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add friend. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', phone: '', avatar: 'boy' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-card-border">
        <DialogHeader>
          <DialogTitle>Add New Friend</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl">
              {AVATAR_OPTIONS.find(option => option.id === formData.avatar)?.emoji || '👦'}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="friend-name">Name *</Label>
              <Input
                id="friend-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter friend's name"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="friend-phone">Phone Number (Optional)</Label>
              <Input
                id="friend-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Choose Avatar</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {AVATAR_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: option.id })}
                    className={cn(
                      "flex items-center justify-center p-4 rounded-lg border transition-all duration-200",
                      "glass-card hover:border-primary/50",
                      formData.avatar === option.id
                        ? "border-primary bg-primary/10"
                        : "border-card-border"
                    )}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{option.emoji}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="flex-1 btn-primary-glass"
            >
              Add Friend
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
import React, { useState } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddFriendDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddFriendDialog: React.FC<AddFriendDialogProps> = ({ open, onClose }) => {
  const { addFriend } = useFriends();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: ''
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
      addFriend({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        avatar: formData.avatar.trim() || undefined,
      });

      toast({
        title: "Friend added",
        description: `${formData.name} has been added to your friends list.`,
      });

      // Reset form and close dialog
      setFormData({ name: '', phone: '', avatar: '' });
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
    setFormData({ name: '', phone: '', avatar: '' });
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
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.avatar} />
              <AvatarFallback className="bg-primary/20">
                {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
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
              <Label htmlFor="friend-avatar">Avatar URL (Optional)</Label>
              <Input
                id="friend-avatar"
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="Enter avatar image URL"
                className="mt-1"
              />
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
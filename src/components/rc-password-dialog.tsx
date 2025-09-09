
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface RcPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function RcPasswordDialog({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Authorization Required",
  description = "For security, please enter the access code to proceed."
}: RcPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirm = () => {
    setIsLoading(true);
    const storedRcNumber = localStorage.getItem('rcNumber');

    if (!storedRcNumber) {
      toast({
        variant: 'destructive',
        title: 'Authorization Failed',
        description: 'No access code found. Please set one in your business details.',
      });
      setIsLoading(false);
      onClose();
      return;
    }

    if (password === storedRcNumber) {
      toast({
        title: 'Authorization Successful',
      });
      onConfirm();
      onClose();
    } else {
      toast({
        variant: 'destructive',
        title: 'Authorization Failed',
        description: 'The access code entered is incorrect.',
      });
    }
    setPassword('');
    setIsLoading(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword('');
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rc-password">Access Code</Label>
            <Input
              id="rc-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access code"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

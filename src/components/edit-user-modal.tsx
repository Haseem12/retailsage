
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { User } from './user-management';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://sagheerplus.com.ng/retaillab';

async function safeJsonParse(response: Response) {
    try {
        return await response.json();
    } catch (error) {
        const text = await response.text();
        throw new Error(`Failed to parse JSON. Server responded with: ${text}`);
    }
}

const shopTypes = [
  "Fuel Station",
  "Restaurant",
  "Electronics Store",
  "Supermarket/FMCG",
  "Apparel Store",
  "Other"
];

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUserUpdate: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, onUserUpdate }: EditUserModalProps) {
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [shopType, setShopType] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
        setBusinessName(user.business_name || '');
        setBusinessAddress(user.business_address || '');
        setShopType(user.shop_type || '');
        setRcNumber(user.rc_number || '');
        setPhoneNumber(user.phone_number || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!businessName || !shopType || !businessAddress) {
       setError('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-details.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
             userId: user.id,
             businessName, 
             businessAddress, 
             shopType, 
             rcNumber, 
             phoneNumber 
        }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save details.');
      }
      
      toast({
        title: 'User Updated',
        description: `Details for ${user.email} have been successfully updated.`
      });
      onUserUpdate();
      onClose();

    } catch (error: any) {
      setError(error.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Edit User: {user.email}</DialogTitle>
                <DialogDescription>Update the business details for this user.</DialogDescription>
            </DialogHeader>
             <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                    {error && (
                        <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="businessAddress">Business Address</Label>
                        <Input id="businessAddress" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Shop Type</Label>
                        <Select onValueChange={setShopType} value={shopType} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a shop type" />
                            </SelectTrigger>
                            <SelectContent>
                                {shopTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rcNumber">RC Number (Optional)</Label>
                        <Input id="rcNumber" value={rcNumber} onChange={(e) => setRcNumber(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                        <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
}

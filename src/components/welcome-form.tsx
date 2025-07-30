
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import RetailLabLogo from './retaillab-logo';
import { Label } from './ui/label';

const API_BASE_URL = 'https://arewaskills.com.ng/retaillab';

const shopTypes = [
  "Fuel Station",
  "Restaurant",
  "Electronics Store",
  "Supermarket/FMCG",
  "Apparel Store",
  "Other"
];

export default function WelcomeForm() {
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [shopType, setShopType] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('new-user-id');
    if (!storedUserId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No user ID found. Please sign up again.',
      });
      router.push('/signup');
    } else {
      setUserId(storedUserId);
    }
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !shopType || !businessAddress) {
       toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-details.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, businessName, businessAddress, shopType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save details.');
      }
      
      // Store shopType for dashboard customization simulation
      localStorage.setItem('shopType', shopType);
      
      sessionStorage.removeItem('new-user-id'); // Clean up stored ID

      toast({
        title: 'Setup Complete!',
        description: 'Your business details have been saved. Please log in.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl z-10 bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
         <div className="flex justify-center items-center gap-2 mb-4">
            <RetailLabLogo className="w-10 h-10" />
        </div>
        <CardTitle>Welcome to RetailLab!</CardTitle>
        <CardDescription>Let's get your business set up. Tell us a bit about your store.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              type="text"
              placeholder="e.g., Acme Superstore"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="bg-background/70"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Input
              id="businessAddress"
              type="text"
              placeholder="e.g., 123 Market Street"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              required
              className="bg-background/70"
            />
          </div>
          <div className="space-y-2">
            <Label>Shop Type</Label>
            <Select onValueChange={setShopType} value={shopType} required>
                <SelectTrigger className="bg-background/70">
                    <SelectValue placeholder="Select a shop type" />
                </SelectTrigger>
                <SelectContent>
                    {shopTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading || !userId}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Complete Setup'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

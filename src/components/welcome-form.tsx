
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import RetailLabLogo from './retaillab-logo';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';

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
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('new-user-id');
    if (!storedUserId) {
      setMessage({ type: 'error', text: 'No user ID found. Please sign up again.' });
      // Redirect after a short delay to allow user to read the message
      setTimeout(() => router.push('/signup'), 3000);
    } else {
      setUserId(storedUserId);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); 
    if (!businessName || !shopType || !businessAddress) {
       setMessage({ type: 'error', text: 'Please fill out all fields.' });
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
      
      localStorage.setItem('shopType', shopType);
      
      sessionStorage.removeItem('new-user-id');

      setMessage({ type: 'success', text: 'Your business details have been saved. Redirecting to login...' });
      setTimeout(() => router.push('/login'), 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An unknown error occurred.' });
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
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={cn(message.type === 'success' && 'border-green-500/50 text-green-500 dark:border-green-500 [&>svg]:text-green-500')}>
              {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertTitle>{message.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
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

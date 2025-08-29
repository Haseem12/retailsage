
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import SajFoodsLogo from './sajfoods-logo';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';

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

export default function WelcomeForm() {
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [shopType, setShopType] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('new-user-id');
    if (!storedUserId) {
      setMessage({ type: 'error', text: 'No user ID found. Please sign up again.' });
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
        body: JSON.stringify({ userId, businessName, businessAddress, shopType, rcNumber, phoneNumber }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save details.');
      }
      
      localStorage.setItem('shopType', shopType);
      localStorage.setItem('businessName', businessName);
      localStorage.setItem('businessAddress', businessAddress);
      localStorage.setItem('rcNumber', rcNumber);
      localStorage.setItem('phoneNumber', phoneNumber);
      
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
            <SajFoodsLogo className="w-10 h-10" />
        </div>
        <CardTitle>Welcome to SAJ FOODS!</CardTitle>
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
           <div className="space-y-2">
                <Label htmlFor="rcNumber">RC Number (Optional)</Label>
                <Input id="rcNumber" value={rcNumber} onChange={(e) => setRcNumber(e.target.value)} placeholder="e.g. 123456" className="bg-background/70" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. 080-1234-5678" className="bg-background/70" />
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

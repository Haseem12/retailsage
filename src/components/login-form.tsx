
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import RetailSageLogo from './retailsage-logo';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const API_BASE_URL = 'https://sagheerplus.com.ng/retaillab';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }
      
      sessionStorage.setItem('user-token', data.token);
      
      if (data.shopType) {
        localStorage.setItem('shopType', data.shopType);
      } else {
        localStorage.removeItem('shopType');
      }

      if (data.businessName) {
        localStorage.setItem('businessName', data.businessName);
      }
      if (data.businessAddress) {
        localStorage.setItem('businessAddress', data.businessAddress);
      }
      if (data.rcNumber) {
        localStorage.setItem('rcNumber', data.rcNumber);
      }
      if (data.phoneNumber) {
        localStorage.setItem('phoneNumber', data.phoneNumber);
      }

      if (data.shopType === 'Fuel Station') {
        router.push('/dashboard/fuel-management');
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An unknown error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl z-10 bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
            <RetailSageLogo className="w-10 h-10" />
            <h1 className="text-4xl font-bold font-headline">RetailSage</h1>
        </div>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="flex flex-col gap-4">
           {message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background/70"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
             className="bg-background/70"
          />
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
          </Button>
        </CardContent>
      </form>
      <CardFooter className="text-center text-sm">
        <p>Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link></p>
      </CardFooter>
    </Card>
  );
}

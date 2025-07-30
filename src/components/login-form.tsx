
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import RetailLabLogo from './retaillab-logo';

const API_BASE_URL = 'https://arewaskills.com.ng/retaillab';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
      
      // The user's shopType is now returned from the backend on login.
      if (data.shopType) {
        localStorage.setItem('shopType', data.shopType);
      } else {
        // If shopType is not returned (e.g., user hasn't finished setup), remove it.
        localStorage.removeItem('shopType');
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back to RetailLab!',
      });

      if (data.shopType === 'Fuel Station') {
        router.push('/dashboard/fuel-management');
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl z-10 bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
            <RetailLabLogo className="w-10 h-10" />
            <h1 className="text-4xl font-bold font-headline">RetailLab</h1>
        </div>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="flex flex-col gap-4">
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

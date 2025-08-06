
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import RetailSageLogo from './retailsage-logo';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';

const API_BASE_URL = 'https://sagheerplus.com.ng/retaillab';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed.');
      }
      
      if (data.userId) {
        sessionStorage.setItem('new-user-id', data.userId);
      }

      setMessage({ type: 'success', text: "Account created! Let's set up your business details." });
      setTimeout(() => router.push('/welcome'), 2000);

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
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Join us and get AI-powered retail insights.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="flex flex-col gap-4">
           {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={cn(message.type === 'success' && 'border-green-500/50 text-green-500 dark:border-green-500 [&>svg]:text-green-500')}>
              {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertTitle>{message.type === 'error' ? 'Signup Failed' : 'Success'}</AlertTitle>
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
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-background/70"
          />
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
          </Button>
        </CardContent>
      </form>
      <CardFooter className="text-center text-sm">
        <p>Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link></p>
      </CardFooter>
    </Card>
  );
}

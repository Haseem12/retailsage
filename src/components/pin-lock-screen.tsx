
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import SajFoodsLogo from './sajfoods-logo';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Input } from './ui/input';
import Link from 'next/link';

export default function PinLockScreen() {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('user-token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const userPin = localStorage.getItem('user-pin');
    setStoredPin(userPin);
    setHasPin(!!userPin);
    if (!userPin) {
      setMessage({ type: 'info', text: 'Please set up a PIN for this device.' });
    }
  }, [router]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setPin(value);
      if (value.length === 4 && hasPin) {
        verifyPin(value);
      }
    }
  };

  const verifyPin = (currentPin: string) => {
    if (currentPin === storedPin) {
        const shopType = localStorage.getItem('shopType');
        if (shopType === 'Fuel Station') {
            router.push('/dashboard/fuel-management');
        } else {
            router.push('/dashboard');
        }
    } else {
      setMessage({ type: 'error', text: 'Incorrect PIN. Please try again.' });
      setTimeout(() => {
        setPin('');
        setMessage(hasPin ? null : { type: 'info', text: 'Please set up a PIN for this device.' });
      }, 1000);
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('user-token');
    // Keep PIN for next login
    router.push('/login');
  };

  if (!hasPin) {
    return (
      <Card className="w-full max-w-sm shadow-2xl z-10 bg-card/80 backdrop-blur-sm border-border/50 text-center">
        <CardHeader>
          <div className="flex justify-center items-center gap-2 mb-4">
            <SajFoodsLogo className="w-10 h-10" />
          </div>
          <CardTitle>Create a PIN</CardTitle>
          <CardDescription>To secure your app, please create a 4-digit PIN for this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription>
              No PIN is set for this device. Please go to settings to create one. You will be redirected there after logging in.
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/dashboard/settings">Go to Settings</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl z-10 bg-card/80 backdrop-blur-sm border-border/50 text-center">
      <CardHeader>
        <div className="flex justify-center items-center gap-2 mb-4">
            <SajFoodsLogo className="w-10 h-10" />
        </div>
        <CardTitle>Enter PIN</CardTitle>
        <CardDescription>Enter your 4-digit PIN to unlock.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
         {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="animate-in fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{message.type === 'error' ? 'Error' : 'Info'}</AlertTitle>
            <AlertDescription>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
        <Input
          type="password"
          maxLength={4}
          value={pin}
          onChange={handlePinChange}
          className="text-center text-2xl tracking-[1em] bg-background/70"
          autoFocus
        />
        <Button variant="link" onClick={handleLogout}>Logout</Button>
      </CardContent>
    </Card>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import RetailSageLogo from './retailsage-logo';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Input } from './ui/input';

const CORRECT_PIN = "1234"; // Hardcoded for now

export default function PinLockScreen() {
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('user-token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setPin(value);
      if (value.length === 4) {
        verifyPin(value);
      }
    }
  };

  const verifyPin = (currentPin: string) => {
    if (currentPin === CORRECT_PIN) {
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
        setMessage(null);
      }, 1000);
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('user-token');
    localStorage.clear();
    router.push('/login');
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl z-10 bg-card/80 backdrop-blur-sm border-border/50 text-center">
      <CardHeader>
        <div className="flex justify-center items-center gap-2 mb-4">
            <RetailSageLogo className="w-10 h-10" />
        </div>
        <CardTitle>Enter PIN</CardTitle>
        <CardDescription>Enter your 4-digit PIN to unlock.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
         {message && (
          <Alert variant="destructive" className="animate-in fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
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

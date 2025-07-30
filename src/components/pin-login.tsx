'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CORRECT_PIN } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Gem } from 'lucide-react';

export default function PinLogin() {
  const [pin, setPin] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePinChange = (value: string) => {
    if (pin.length < 4) {
      setPin(pin + value);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleLogin = () => {
    if (pin === CORRECT_PIN) {
      toast({
        title: 'Login Successful',
        description: 'Welcome to RetailSage!',
      });
      router.push('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Incorrect PIN. Please try again.',
      });
      setPin('');
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
            <Gem className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline">RetailSage</h1>
        </div>
        <CardTitle>Enter PIN</CardTitle>
        <CardDescription>Enter your 4-digit PIN to access the terminal.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex justify-center">
          <Input
            type="password"
            value={pin}
            readOnly
            className="w-40 text-center text-2xl tracking-[1.5rem]"
            maxLength={4}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[ '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <Button
              key={num}
              variant="outline"
              size="lg"
              className="text-2xl font-bold h-16"
              onClick={() => handlePinChange(num)}
            >
              {num}
            </Button>
          ))}
           <Button
            variant="outline"
            size="lg"
            className="text-2xl font-bold h-16"
            onClick={handleDelete}
          >
            Del
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-2xl font-bold h-16"
            onClick={() => handlePinChange('0')}
          >
            0
          </Button>
           <Button size="lg" className="text-xl font-bold h-16 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleLogin}>
            Enter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function PinManagement() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedPin = localStorage.getItem('user-pin');
    setCurrentPin(storedPin);
  }, []);

  const handleSavePin = () => {
    if (pin.length !== 4) {
      toast({
        variant: 'destructive',
        title: 'Invalid PIN',
        description: 'Your PIN must be exactly 4 digits.',
      });
      return;
    }
    if (pin !== confirmPin) {
      toast({
        variant: 'destructive',
        title: 'PINs Do Not Match',
        description: 'Please ensure both PIN fields are identical.',
      });
      return;
    }

    localStorage.setItem('user-pin', pin);
    setCurrentPin(pin);
    setPin('');
    setConfirmPin('');
    toast({
      title: 'PIN Saved!',
      description: 'Your new PIN has been set for this device.',
    });
  };

  return (
    <div className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="pin">{currentPin ? 'Enter New PIN' : 'Create PIN'}</Label>
        <Input
          id="pin"
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="4-digit PIN"
          className="text-lg tracking-[0.5em]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPin">Confirm PIN</Label>
        <Input
          id="confirmPin"
          type="password"
          maxLength={4}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          placeholder="Confirm your PIN"
          className="text-lg tracking-[0.5em]"
        />
      </div>
      <Button onClick={handleSavePin} className="bg-accent text-accent-foreground hover:bg-accent/90">
        {currentPin ? 'Update PIN' : 'Save PIN'}
      </Button>
      {currentPin && (
          <p className="text-sm text-muted-foreground pt-2">A PIN is already set for this device. Entering a new one will overwrite it.</p>
      )}
    </div>
  );
}

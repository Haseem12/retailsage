'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RetailSageLogo from './retailsage-logo';
import { useEffect, useState, useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { ReceiptItem } from '@/lib/types';
import { toPng } from 'html-to-image';
import { Loader2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ReceiptItem[];
  subtotal: number;
  saleId: string;
}

export default function ReceiptModal({ isOpen, onClose, items, subtotal, saleId }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [businessDetails, setBusinessDetails] = useState({ name: 'RetailSage', address: '123 Market St, Anytown, USA', rcNumber: '', phoneNumber: '' });
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const [rcInput, setRcInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      const name = localStorage.getItem('businessName') || 'RetailSage';
      const address = localStorage.getItem('businessAddress') || '123 Market St, Anytown, USA';
      const rcNumber = localStorage.getItem('rcNumber') || '';
      const phoneNumber = localStorage.getItem('phoneNumber') || '';

      setBusinessDetails({ name, address, rcNumber, phoneNumber });
      setRcInput(rcNumber);
      setPhoneInput(phoneNumber);

      if (!rcNumber || !phoneNumber) {
        setShowDetailsForm(true);
      } else {
        setShowDetailsForm(false);
      }
    }
    setIsAndroid(/android/i.test(navigator.userAgent));
  }, [isOpen]);

  const total = subtotal;
  const date = new Date();

  const handlePrint = async () => {
    if (!receiptRef.current) return;
    setIsPrinting(true);

    try {
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true });
      const imageBlob = await fetch(dataUrl).then(res => res.blob());
      const imageUrl = URL.createObjectURL(imageBlob);

      const printPayload = [
        {
          type: 1, // image
          path: imageUrl,
          align: 1, // center
        },
      ];
      
      const printUrl = `my.bluetoothprint.scheme://${encodeURIComponent(JSON.stringify(printPayload))}`;
      
      // Since direct navigation might be blocked, creating a link for the user to click.
      const a = document.createElement('a');
      a.href = printUrl;
      a.click();

    } catch (err) {
      console.error('oops, something went wrong!', err);
    } finally {
        setIsPrinting(false);
    }
  };

  const handleSaveDetails = () => {
    localStorage.setItem('rcNumber', rcInput);
    localStorage.setItem('phoneNumber', phoneInput);
    setBusinessDetails(prev => ({ ...prev, rcNumber: rcInput, phoneNumber: phoneInput }));
    setShowDetailsForm(false);
  }

  const renderDetailsForm = () => (
    <>
       <DialogHeader>
        <DialogTitle>Complete Business Details</DialogTitle>
        <DialogDescription>
          Please provide your RC Number and Phone Number to include them on the receipt.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="rcNumber">RC Number</Label>
          <Input id="rcNumber" value={rcInput} onChange={(e) => setRcInput(e.target.value)} placeholder="e.g. 123456" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="e.g. 080-1234-5678" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSaveDetails}>Save and Continue</Button>
      </DialogFooter>
    </>
  );

  const renderReceiptContent = () => (
    <>
      <div ref={receiptRef} className="print-content p-2 bg-white text-black" style={{ fontFamily: 'monospace', width: '300px' }}>
        <header className="text-center items-center">
          <div className="flex justify-center">
            <RetailSageLogo className="w-8 h-8 my-2 text-black"/>
          </div>
          <h2 className="font-sans text-lg font-bold">{businessDetails.name}</h2>
          <p className="text-xs">{businessDetails.address}</p>
          <div className="text-xs">
            {businessDetails.rcNumber && <p>RC: {businessDetails.rcNumber}</p>}
            {businessDetails.phoneNumber && <p>Tel: {businessDetails.phoneNumber}</p>}
            <p>{date.toLocaleDateString()} {date.toLocaleTimeString()}</p>
          </div>
        </header>
        <div className="border-t border-b border-dashed border-black py-2 my-2 space-y-1 text-xs">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.quantity}x {item.name}</span>
              <span>N{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>N{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-black pt-1 mt-1">
            <span>TOTAL:</span>
            <span>N{total.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-center text-xs mt-4">Thank you for your purchase!</p>
      </div>
      <DialogFooter className="mt-4">
        <Button onClick={handlePrint} variant="outline" disabled={isPrinting}>
           {isPrinting ? <Loader2 className="mr-2 animate-spin"/> : null}
           Print
        </Button>
        <Button onClick={onClose} className="bg-accent text-accent-foreground hover:bg-accent/90">Close</Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm font-mono text-sm bg-card/90 backdrop-blur-sm">
        {showDetailsForm ? renderDetailsForm() : renderReceiptContent()}
      </DialogContent>
    </Dialog>
  );
}

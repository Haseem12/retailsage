'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RetailLabLogo from './retaillab-logo';
import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { ReceiptItem } from '@/lib/types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ReceiptItem[];
  subtotal: number;
  saleId: string;
}

export default function ReceiptModal({ isOpen, onClose, items, subtotal, saleId }: ReceiptModalProps) {
  const [businessDetails, setBusinessDetails] = useState({ name: 'RetailLab', address: '123 Market St, Anytown, USA', rcNumber: '', phoneNumber: '' });
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  
  const [rcInput, setRcInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      const name = localStorage.getItem('businessName') || 'RetailLab';
      const address = localStorage.getItem('businessAddress') || '123 Market St, Anytown, USA';
      const rcNumber = localStorage.getItem('rcNumber') || '';
      const phoneNumber = localStorage.getItem('phoneNumber') || '';

      setBusinessDetails({ name, address, rcNumber, phoneNumber });

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

  const handlePrint = () => {
    window.print();
  }

  const handleSaveDetails = () => {
    localStorage.setItem('rcNumber', rcInput);
    localStorage.setItem('phoneNumber', phoneInput);
    setBusinessDetails(prev => ({ ...prev, rcNumber: rcInput, phoneNumber: phoneInput }));
    setShowDetailsForm(false);
    setRcInput('');
    setPhoneInput('');
  }

  const printUrl = `${window.location.origin}/api/print?saleId=${saleId}`;
  
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
      <style>{`
        @media print {
          .print-content {
            font-family: 'Courier New', monospace;
            color: black;
          }
          .print\\:text-black { color: black !important; }
          .print\\:text-gray-600 { color: #555 !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
      <div className="print-content">
        <DialogHeader className="text-center items-center">
          <RetailLabLogo className="w-8 h-8 my-2 print:text-black"/>
          <DialogTitle className="font-sans text-lg font-bold">{businessDetails.name}</DialogTitle>
          <DialogDescription className="print:text-gray-600">{businessDetails.address}</DialogDescription>
          <div className="text-xs print:text-gray-600">
            {businessDetails.rcNumber && <p>RC: {businessDetails.rcNumber}</p>}
            {businessDetails.phoneNumber && <p>Tel: {businessDetails.phoneNumber}</p>}
            <p>{date.toLocaleDateString()} {date.toLocaleTimeString()}</p>
          </div>
        </DialogHeader>
        <div className="border-t border-b border-dashed py-2 my-2 space-y-1">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.quantity}x {item.name}</span>
              <span>₦{(item.quantity * item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₦{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-dashed pt-1 mt-1">
            <span>TOTAL:</span>
            <span>₦{total.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-center text-xs mt-4 print:text-gray-600">Thank you for your purchase!</p>
      </div>
      <DialogFooter className="mt-4 print:hidden">
        {isAndroid ? (
          <Button asChild variant="outline">
            <a href={`my.bluetoothprint.scheme://${printUrl}`}>Print with App</a>
          </Button>
        ) : (
          <Button onClick={handlePrint} variant="outline">Print</Button>
        )}
        <Button onClick={onClose} className="bg-accent text-accent-foreground hover:bg-accent/90">Close</Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm font-mono text-sm bg-card/90 backdrop-blur-sm print:shadow-none print:border-none print:bg-white print:text-black">
        {showDetailsForm ? renderDetailsForm() : renderReceiptContent()}
      </DialogContent>
    </Dialog>
  );
}

'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RetailLabLogo from './retaillab-logo';
import { useEffect, useState } from 'react';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ReceiptItem[];
  subtotal: number;
}

export default function ReceiptModal({ isOpen, onClose, items, subtotal }: ReceiptModalProps) {
  const [businessDetails, setBusinessDetails] = useState({ name: 'RetailLab', address: '123 Market St, Anytown, USA' });
  
  useEffect(() => {
    if (isOpen) {
      const name = localStorage.getItem('businessName');
      const address = localStorage.getItem('businessAddress');
      if (name && address) {
        setBusinessDetails({ name, address });
      }
    }
  }, [isOpen]);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const date = new Date();

  const handlePrint = () => {
    // This is a browser API and will trigger the print dialog
    window.print();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm font-mono text-sm bg-card/90 backdrop-blur-sm print:shadow-none print:border-none print:bg-white print:text-black">
        <div className="print-content">
          <DialogHeader className="text-center items-center">
            <RetailLabLogo className="w-8 h-8 my-2 print:text-black"/>
            <DialogTitle className="font-sans text-lg font-bold">{businessDetails.name}</DialogTitle>
            <DialogDescription className="print:text-gray-600">{businessDetails.address}</DialogDescription>
            <div className="text-xs print:text-gray-600">
              <p>RC: 123456 | Tel: 080-1234-5678</p>
              <p>{date.toLocaleDateString()} {date.toLocaleTimeString()}</p>
            </div>
          </DialogHeader>
          <div className="border-t border-b border-dashed py-2 my-2 space-y-1">
            {items.map((item) => (
              <div key={item.name} className="flex justify-between">
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
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span>₦{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-dashed pt-1 mt-1">
              <span>TOTAL:</span>
              <span>₦{total.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-center text-xs mt-4 print:text-gray-600">Thank you for your purchase!</p>
        </div>
        <DialogFooter className="mt-4 print:hidden">
          <Button onClick={handlePrint} variant="outline">Print</Button>
          <Button onClick={onClose} className="bg-accent text-accent-foreground hover:bg-accent/90">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AgriLabLogo from './agrilab-logo';

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
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const date = new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm font-mono text-sm bg-card/90 backdrop-blur-sm">
        <DialogHeader className="text-center items-center">
          <AgriLabLogo className="w-8 h-8 my-2"/>
          <DialogTitle className="font-headline text-lg">AgriLab</DialogTitle>
          <DialogDescription>123 Market St, Anytown, USA</DialogDescription>
          <p>{date.toLocaleDateString()} {date.toLocaleTimeString()}</p>
        </DialogHeader>
        <div className="border-t border-b border-dashed py-2 my-2 space-y-1">
          {items.map((item) => (
            <div key={item.name} className="flex justify-between">
              <span>{item.quantity}x {item.name}</span>
              <span>${(item.quantity * item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (8%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-dashed pt-1 mt-1">
            <span>TOTAL:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-center text-xs mt-4">Thank you for your purchase!</p>
        <DialogFooter className="mt-4">
          <Button onClick={() => window.print()} variant="outline">Print</Button>
          <Button onClick={onClose} className="bg-accent text-accent-foreground hover:bg-accent/90">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

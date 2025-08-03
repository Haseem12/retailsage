
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RetailSageLogo from './retailsage-logo';
import { useEffect, useState, useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { ReceiptItem } from '@/lib/types';
import { Loader2, Copy, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ReceiptItem[];
  subtotal: number;
  saleId: string;
}

export default function ReceiptModal({ isOpen, onClose, items, subtotal, saleId }: ReceiptModalProps) {
  const [businessDetails, setBusinessDetails] = useState({ name: 'RetailSage', address: '123 Market St, Anytown, USA', rcNumber: '', phoneNumber: '' });
  const [printUrl, setPrintUrl] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      const apiUrl = `https://www.arewaskills.com.ng/print/response.php?saleId=${saleId}`;
      
      // Construct the final URL, keeping the https:// part
      const generatedUrl = `my.bluetoothprint.scheme://${apiUrl}`;
      setPrintUrl(generatedUrl);
      
      const name = localStorage.getItem('businessName') || 'RetailSage';
      const address = localStorage.getItem('businessAddress') || '123 Market St, Anytown, USA';
      const rcNumber = localStorage.getItem('rcNumber') || '';
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      setBusinessDetails({ name, address, rcNumber, phoneNumber });
    }
  }, [isOpen, saleId]);

  const total = subtotal;
  const date = new Date();

  const handleCopy = () => {
    if (!printUrl) return;
    navigator.clipboard.writeText(printUrl).then(() => {
        toast({ title: 'URL Copied!', description: 'The print URL has been copied to your clipboard.'});
    }, (err) => {
        toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy the URL.'});
        console.error('Could not copy text: ', err);
    });
  };

  const handleLaunchPrint = () => {
    if (!printUrl) return;
    // Directly setting window.location.href is a more reliable way to launch custom URL schemes
    window.location.href = printUrl;
  }

  const renderReceiptContent = () => (
    <>
      <DialogHeader>
        <DialogTitle>Transaction Complete</DialogTitle>
        <DialogDescription>
          Print the receipt for the customer or close this dialog.
        </DialogDescription>
      </DialogHeader>

      <div className="print-preview p-4 my-4 bg-white text-black rounded-md" style={{ fontFamily: 'monospace', width: '100%' }}>
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
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-black pt-1 mt-1">
            <span>TOTAL:</span>
            <span>N{total.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-center text-xs mt-4">Thank you for your purchase!</p>
      </div>
      
      {printUrl && (
          <div className="space-y-2">
            <Label htmlFor="printUrl">Print URL</Label>
            <div className="flex gap-2">
                <Input id="printUrl" readOnly value={printUrl} className="text-xs" />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
          </div>
      )}

      <DialogFooter className="mt-4 gap-2">
        <Button onClick={handleLaunchPrint} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Printer className="mr-2"/>
            Launch Print App
        </Button>
        <Button onClick={onClose} variant="outline">Close</Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md font-mono text-sm bg-card/90 backdrop-blur-sm">
        {renderReceiptContent()}
      </DialogContent>
    </Dialog>
  );
}

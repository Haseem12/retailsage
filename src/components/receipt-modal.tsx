
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RetailSageLogo from './retailsage-logo';
import { useEffect, useState, useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { ReceiptItem } from '@/lib/types';
import { toPng } from 'html-to-image';
import { Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [printUrl, setPrintUrl] = useState('');
  const { toast } = useToast();
  
  const [rcInput, setRcInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPrintUrl(''); // Reset URL when modal opens
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
  }, [isOpen]);

  const total = subtotal;
  const date = new Date();

  const handleGenerateUrl = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    setPrintUrl('');

    try {
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true });
      const imageBlob = await fetch(dataUrl).then(res => res.blob());
      
      // We need a persistent URL, so we can't use `createObjectURL` as it's session-specific.
      // A simple solution is to upload the image somewhere or use the long dataURI.
      // Let's use the dataURI directly. The printing app must support it.
      // This is a trade-off for not having a dedicated image upload service.
      
      const printPayload = [
        {
          type: 1, // image
          path: dataUrl, // Use the base64 data URI
          align: 1, // center
        },
      ];
      
      const generatedUrl = `my.bluetoothprint.scheme://${encodeURIComponent(JSON.stringify(printPayload))}`;
      setPrintUrl(generatedUrl);
      toast({ title: 'Print URL Generated', description: 'You can now copy the URL or launch the print app.' });

    } catch (err) {
      console.error('oops, something went wrong!', err);
      toast({ variant: 'destructive', title: 'Error Generating Image', description: 'Could not create the receipt image.' });
    } finally {
        setIsGenerating(false);
    }
  };

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
    const a = document.createElement('a');
    a.href = printUrl;
    a.click();
  }

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
      
      {printUrl && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="printUrl">Print URL</Label>
            <div className="flex gap-2">
                <Input id="printUrl" readOnly value={printUrl} className="text-xs" />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
          </div>
      )}

      <DialogFooter className="mt-4">
        {printUrl ? (
             <Button onClick={handleLaunchPrint} className="bg-accent text-accent-foreground hover:bg-accent/90">Launch Print</Button>
        ) : (
            <Button onClick={handleGenerateUrl} variant="outline" disabled={isGenerating}>
               {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : null}
               Generate Print URL
            </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md font-mono text-sm bg-card/90 backdrop-blur-sm">
        {showDetailsForm ? renderDetailsForm() : renderReceiptContent()}
      </DialogContent>
    </Dialog>
  );
}

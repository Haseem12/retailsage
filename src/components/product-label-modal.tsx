
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type Product } from '@/lib/types';
import Barcode from 'react-barcode';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import RetailLabLogo from './retaillab-logo';

interface ProductLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const LabelContent = ({ product, componentRef }: { product: Product, componentRef: React.Ref<HTMLDivElement> }) => {
    return (
        <div ref={componentRef} className="p-4 border-2 border-dashed border-black rounded-lg bg-white text-black font-sans flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <RetailLabLogo className="w-6 h-6 text-black" />
              <span className="font-bold text-lg">RetailLab</span>
            </div>
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-3xl font-extrabold my-2">₦{product.price.toFixed(2)}</p>
            {product.barcode && (
                <Barcode value={product.barcode} height={40} width={1.5} fontSize={12} />
            )}
        </div>
    );
};


export default function ProductLabelModal({ isOpen, onClose, product }: ProductLabelModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Print Product Label</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
            <LabelContent product={product} componentRef={componentRef} />
        </div>

        <DialogFooter>
          <Button onClick={handlePrint}>Print</Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Apple, Milk, Sandwich, Drumstick, Shirt, PersonStanding, Laptop, Headphones, Fuel, Coffee, Croissant,
  Minus, Plus, Trash2, PackageOpen, Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReceiptModal, { type ReceiptItem } from './receipt-modal';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const iconMap: { [key: string]: React.ElementType } = {
  Apple, Milk, Sandwich, Drumstick, Shirt, PersonStanding, Laptop, Headphones, Fuel, Coffee, Croissant,
};

type CartItem = Product & { quantity: number };

interface Sale {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
}

export default function PosSystem() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState('pos');
  const [calculatorInput, setCalculatorInput] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{items: ReceiptItem[], subtotal: number, saleId: string} | null>(null);

  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if(products.length > 0) {
      setActiveTab(products[0].category)
    }
  }, []);
  
  const getProductStock = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.stock : 0;
  }

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prevCart; // Don't add more than available in stock
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    const stock = getProductStock(productId);
    if (newQuantity > stock) {
      newQuantity = stock; // Cap quantity at stock level
    }
    
    setCart((prevCart) => {
      if (newQuantity <= 0) {
        return prevCart.filter((item) => item.id !== productId);
      }
      return prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  
  const categories = [...new Set(products.map(p => p.category))];

  const handleCalcInput = (value: string) => {
     if (value === 'C') {
      setCalculatorInput('');
    } else if (value === '=') {
      try {
        const result = eval(calculatorInput.replace(/[^-()\d/*+.]/g, ''));
        setCalculatorInput(result.toString());
      } catch (error) {
        setCalculatorInput('Error');
      }
    } else {
      setCalculatorInput(prev => prev + value);
    }
  }

  const handlePay = () => {
    if (cart.length === 0) return;

    // Update stock levels
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });
    setProducts(updatedProducts);

    const saleId = `sale_${new Date().getTime()}`;

    const newSale: Sale = {
      items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
      subtotal,
      tax,
      total,
      date: new Date().toISOString(),
    };
    
    setSales([...sales, newSale]);
    
    const businessDetails = {
        name: localStorage.getItem('businessName') || 'RetailLab',
        address: localStorage.getItem('businessAddress') || '123 Market St, Anytown, USA',
        rcNumber: localStorage.getItem('rcNumber') || '',
        phoneNumber: localStorage.getItem('phoneNumber') || '',
    };
    
    const receiptForStorage = {
        ...newSale,
        businessDetails
    };

    sessionStorage.setItem(saleId, JSON.stringify(receiptForStorage));
    
    setReceiptData({items: newSale.items, subtotal: newSale.subtotal, saleId});
    setShowReceipt(true);
    setCart([]);
  };
  
  if (!isClient) {
      return null; // Don't render on server
  }

  const ProductGrid = () => {
    if (products.length === 0) {
      return (
         <Alert>
            <PackageOpen className="h-4 w-4" />
            <AlertTitle>No Products Found</AlertTitle>
            <AlertDescription>
              Your inventory is empty. Please add products to start making sales.
              <Button asChild variant="link" className="p-0 h-auto ml-1">
                <Link href="/dashboard/inventory">Go to Inventory</Link>
              </Button>
            </AlertDescription>
          </Alert>
      )
    }
    return (
      <Tabs defaultValue={categories[0] || ''} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {categories.map(cat => <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>)}
        </TabsList>
        {categories.map(cat => (
           <TabsContent key={cat} value={cat}>
             <ScrollArea className="h-[calc(100vh-28rem)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-1">
                {products.filter(p => p.category === cat).map((product) => {
                  const Icon = iconMap[product.icon] || PackageOpen;
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="h-28 flex flex-col gap-1 p-2 justify-center relative"
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                    >
                      {isOutOfStock && <Badge variant="destructive" className="absolute -top-2 -right-2">Out of Stock</Badge>}
                      <Icon className={cn("w-8 h-8 text-primary", isOutOfStock && "opacity-50")} />
                      <span className="text-xs text-center break-words">{product.name}</span>
                      <span className="text-xs font-bold">₦{product.price.toFixed(2)}</span>
                    </Button>
                  );
                })}
              </div>
             </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  const CalculatorTab = () => (
    <div className="p-4 flex flex-col gap-2 max-w-xs mx-auto">
        <input type="text" value={calculatorInput} readOnly className="w-full bg-muted p-2 rounded-md text-right text-2xl font-mono"/>
        <div className="grid grid-cols-4 gap-2">
            {['7','8','9','/'].map(c => <Button key={c} variant="outline" className="h-14 text-lg" onClick={() => handleCalcInput(c)}>{c}</Button>)}
            {['4','5','6','*'].map(c => <Button key={c} variant="outline" className="h-14 text-lg" onClick={() => handleCalcInput(c)}>{c}</Button>)}
            {['1','2','3','-'].map(c => <Button key={c} variant="outline" className="h-14 text-lg" onClick={() => handleCalcInput(c)}>{c}</Button>)}
            {['0','.','+'].map(c => <Button key={c} variant="outline" className="h-14 text-lg" onClick={() => handleCalcInput(c)}>{c}</Button>)}
            <Button variant="outline" className="h-14 text-lg" onClick={() => handleCalcInput('C')}>C</Button>
            <Button className="h-14 text-lg col-span-3 bg-accent text-accent-foreground" onClick={() => handleCalcInput('=')}>=</Button>
        </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
      <div className="xl:col-span-2">
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pos" disabled={products.length === 0}>Point of Sale</TabsTrigger>
                <TabsTrigger value="calc">Calculator</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {activeTab === 'calc' ? <CalculatorTab /> : <ProductGrid />}
          </CardContent>
        </Card>
      </div>
      <div className="xl:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Current Order</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center">Your cart is empty.</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center">
                      <div className="flex-grow">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">₦{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                        <span>{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                      </div>
                      <p className="w-20 text-right font-medium">₦{(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateQuantity(item.id, 0)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <p>Subtotal</p>
                <p>₦{subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p>Tax (8%)</p>
                <p>₦{tax.toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>₦{total.toFixed(2)}</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-accent text-accent-foreground" onClick={handlePay} disabled={cart.length === 0}>
              Pay Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {receiptData && <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        items={receiptData.items}
        subtotal={receiptData.subtotal}
        saleId={receiptData.saleId}
      />}
    </div>
  );
}

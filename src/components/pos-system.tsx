
'use client';
import { useState } from 'react';
import {
  Apple,
  Milk,
  Sandwich,
  Drumstick,
  Shirt,
  PersonStanding,
  Laptop,
  Headphones,
  Fuel,
  Coffee,
  Croissant,
  X,
  Plus,
  Minus,
  Divide,
  Calculator,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRODUCTS, type Product } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReceiptModal, { type ReceiptItem } from './receipt-modal';

const iconMap: { [key: string]: React.ElementType } = {
  Apple, Milk, Sandwich, Drumstick, Shirt, PersonStanding, Laptop, Headphones, Fuel, Coffee, Croissant,
};

type CartItem = Product & { quantity: number };

export default function PosSystem() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState('pos');
  const [calculatorInput, setCalculatorInput] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
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
  
  const categories = [...new Set(PRODUCTS.map(p => p.category))];

  const handleCalcInput = (value: string) => {
     if (value === 'C') {
      setCalculatorInput('');
    } else if (value === '=') {
      try {
        // Caution: eval is used for simplicity. Not for production without sanitization.
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
    setReceiptItems(cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })));
    setShowReceipt(true);
    setCart([]);
  };

  const ProductGrid = () => (
    <Tabs defaultValue={categories[0]} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        {categories.map(cat => <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>)}
      </TabsList>
      {categories.map(cat => (
         <TabsContent key={cat} value={cat}>
           <ScrollArea className="h-[50vh]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-1">
              {PRODUCTS.filter(p => p.category === cat).map((product) => {
                const Icon = iconMap[product.icon] || Calculator;
                return (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-28 flex flex-col gap-2 p-2 justify-center"
                    onClick={() => addToCart(product)}
                  >
                    <Icon className="w-8 h-8 text-primary" />
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
    <>
      <Card>
        <CardHeader>
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pos">Point of Sale</TabsTrigger>
              <TabsTrigger value="calc">Calculator</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {activeTab === 'pos' ? <ProductGrid /> : <CalculatorTab />}
        </CardContent>
      </Card>

      <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        items={receiptItems}
        subtotal={receiptItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}
      />
    </>
  );
}

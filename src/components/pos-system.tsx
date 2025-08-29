
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Apple, Milk, Sandwich, Drumstick, Shirt, PersonStanding, Laptop, Headphones, Fuel, Coffee, Croissant,
  Minus, Plus, Trash2, PackageOpen, Calculator as CalculatorIcon, Loader2, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReceiptModal from './receipt-modal';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Calculator from './calculator';

const API_BASE_URL = 'https://sagheerplus.com.ng/retaillab';

async function safeJsonParse(response: Response) {
    try {
        return await response.json();
    } catch (error) {
        const text = await response.text();
        throw new Error(`Failed to parse JSON. Server responded with: ${text}`);
    }
}

const iconMap: { [key: string]: React.ElementType } = {
  Apple, Milk, Sandwich, Drumstick, Shirt, PersonStanding, Laptop, Headphones, Fuel, Coffee, Croissant,
};

type CartItem = Product & { quantity: number };

export default function PosSystem() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{items: any[], subtotal: number, saleId: string} | null>(null);
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const token = sessionStorage.getItem('user-token');
      const response = await fetch(`${API_BASE_URL}/api/products.php?action=read`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await safeJsonParse(response);
        throw new Error(errorData.message || 'Failed to fetch products');
      }
      
      const data = await safeJsonParse(response);
      
      const availableProducts = (data.products || []).map((p: any) => ({
        ...p,
        price: parseFloat(p.price),
        stock: parseInt(p.stock, 10),
      }));

      setProducts(availableProducts);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error fetching products', description: error.message });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchProducts();
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
  const total = subtotal;
  
  const categories = [...new Set(products.map(p => p.category))];

  const handlePay = async () => {
    if (cart.length === 0) return;
    setIsPaying(true);

    const saleItems = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    try {
      const token = sessionStorage.getItem('user-token');
      const response = await fetch(`${API_BASE_URL}/api/sales.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          action: 'create',
          total,
          items: saleItems
        })
      });

      const data = await safeJsonParse(response);
      if (!response.ok) throw new Error(data.message || 'Failed to process payment');

      const saleId = `sale_${data.sale_id}`; // Use the ID from the backend
      
      const receiptItemsForDisplay = cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price }));
      
      setReceiptData({ items: receiptItemsForDisplay, subtotal, saleId });
      setShowReceipt(true);
      setCart([]);
      fetchProducts(); // Refresh product stock levels after sale

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Payment Error', description: error.message });
    } finally {
      setIsPaying(false);
    }
  };
  
  if (!isClient) {
      return null; // Don't render on server
  }

  const renderProductGrid = () => {
    if (loadingProducts) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }
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

    const productsToShow = products.filter(p => p.category === selectedCategory);

    return (
      <ScrollArea className="h-[calc(100vh-28rem)]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-1">
          {productsToShow.map((product) => {
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
    );
  };

  const renderCategoryGrid = () => {
     if (loadingProducts) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }
    if (categories.length === 0) {
       return (
         <Alert>
            <PackageOpen className="h-4 w-4" />
            <AlertTitle>No Products or Categories Found</AlertTitle>
            <AlertDescription>
              Please add products with categories in your inventory to begin.
              <Button asChild variant="link" className="p-0 h-auto ml-1">
                <Link href="/dashboard/inventory/add">Add Product</Link>
              </Button>
            </AlertDescription>
          </Alert>
      )
    }
    return (
      <ScrollArea className="h-[calc(100vh-28rem)]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-1">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="h-28 flex flex-col gap-1 p-2 justify-center"
              onClick={() => setSelectedCategory(category)}
            >
              <PackageOpen className="w-10 h-10 text-primary" />
              <span className="text-sm font-semibold">{category}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
                {selectedCategory ? `Products in ${selectedCategory}` : 'Select a Category'}
            </CardTitle>
            {selectedCategory && (
                <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Categories
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
            {selectedCategory ? renderProductGrid() : renderCategoryGrid()}
        </CardContent>
      </Card>
      
      <div className="lg:col-span-1 space-y-8">
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
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>₦{total.toFixed(2)}</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-accent text-accent-foreground" onClick={handlePay} disabled={cart.length === 0 || isPaying}>
              {isPaying ? <Loader2 className="animate-spin" /> : 'Pay Now'}
            </Button>
          </CardContent>
        </Card>
        <Calculator />
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

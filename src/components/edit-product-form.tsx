
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const API_BASE_URL = 'https://sagheerplus.com.ng/retaillab';

export default function EditProductForm({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [additionalStock, setAdditionalStock] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setIsFetching(true);
      try {
        const token = sessionStorage.getItem('user-token');
        // We assume the products.php can handle a GET with an ID, but it doesn't.
        // So we fetch all and filter. This is inefficient but works with the current backend.
        const response = await fetch(`${API_BASE_URL}/api/products.php`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch products');

        const products = (data.products || []).map((p: any) => ({
          ...p,
          price: parseFloat(p.price),
          stock: parseInt(p.stock, 10),
        }));
        
        const foundProduct = products.find((p: Product) => String(p.id) === productId);
        
        if (foundProduct) {
          setProduct(foundProduct);
          setName(foundProduct.name);
          setPrice(String(foundProduct.price));
          setCurrentStock(String(foundProduct.stock));
        } else {
          throw new Error('Product not found.');
        }

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error fetching product',
          description: error.message,
        });
        router.push('/dashboard/inventory');
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [productId, router, toast]);

  const handleUpdateProduct = async () => {
    if (!name || !price) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('user-token');
      const response = await fetch(`${API_BASE_URL}/api/products.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'update',
          id: parseInt(productId, 10),
          name: name,
          price: parseFloat(price),
          stock: (parseInt(currentStock, 10) || 0) + (parseInt(additionalStock, 10) || 0)
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      toast({
        title: 'Product Updated!',
        description: `${name} has been successfully updated.`,
      });

      router.push('/dashboard/inventory');

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Updating Product',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="price">Price (₦)</Label>
                <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="current-stock">Current Stock</Label>
                <Input id="current-stock" type="number" value={currentStock} onChange={e => setCurrentStock(e.target.value)} />
            </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="add-stock">Add Additional Stock</Label>
          <Input id="add-stock" type="number" value={additionalStock} onChange={e => setAdditionalStock(e.target.value)} placeholder="e.g. 50" />
        </div>

        <div className="flex justify-end gap-2">
           <Button variant="ghost" onClick={() => router.push('/dashboard/inventory')}>
                Cancel
            </Button>
            <Button onClick={handleUpdateProduct} disabled={isLoading} className="bg-yellow-600 hover:bg-yellow-700">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
            </Button>
        </div>
      </div>
  );
}

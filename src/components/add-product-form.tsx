
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Product } from '@/lib/types';
import { Loader2, Wand2 } from 'lucide-react';
import { suggestProductDetails } from '@/ai/flows/suggest-product-details';
import { useToast } from '@/hooks/use-toast';
import Barcode from 'react-barcode';

export default function AddProductForm() {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const generateBarcode = () => {
    // Generate a random 12-digit UPC-A compatible barcode
    const newBarcode = Math.random().toString().slice(2, 14);
    setBarcode(newBarcode);
  };
  
  // Generate initial barcode on mount
  useState(() => {
    generateBarcode();
  });

  const handleSuggestion = async () => {
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Product Name Required',
        description: 'Please enter a product name to get AI suggestions.',
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestProductDetails({ productName: name });
      setCategory(result.category);
      setDescription(result.description);
      toast({
        title: 'Suggestions Loaded!',
        description: 'AI-powered suggestions have been added to the form.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: 'Could not fetch AI suggestions. Please try again.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddProduct = () => {
    if (!name || !price || !stock || !category || !barcode) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }
    setIsLoading(true);

    const newProduct: Product = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category,
      icon: 'PackageOpen', // Default icon
      barcode,
      description,
    };

    setProducts([...products, newProduct]);
    
    toast({
      title: 'Product Added!',
      description: `${name} has been successfully added to your inventory.`,
    });

    router.push('/dashboard/inventory');
  };

  return (
    <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <div className="flex gap-2">
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Organic Apples" />
            <Button onClick={handleSuggestion} disabled={isSuggesting || !name} variant="outline">
              {isSuggesting ? <Loader2 className="animate-spin" /> : <Wand2 className="mr-2" />}
              AI Suggest
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="price">Price (₦)</Label>
                <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 5.99" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="e.g., 100" />
            </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder="AI will suggest this, or enter manually" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="AI will suggest this, or enter manually" />
        </div>

        <div className="space-y-2 flex flex-col items-center">
            <Label>Generated Barcode</Label>
            {barcode && <Barcode value={barcode} height={50} />}
            <Button variant="link" size="sm" onClick={generateBarcode}>Generate New Barcode</Button>
        </div>

        <div className="flex justify-end gap-2">
           <Button variant="ghost" onClick={() => router.push('/dashboard/inventory')}>
                Cancel
            </Button>
            <Button onClick={handleAddProduct} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Save Product'}
            </Button>
        </div>
      </div>
  );
}

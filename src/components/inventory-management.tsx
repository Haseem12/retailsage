
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Product } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Printer, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProductLabelModal from './product-label-modal';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://sagheerplus.com.ng/retaillab';

async function safeJsonParse(response: Response) {
    try {
        return await response.json();
    } catch (error) {
        const text = await response.text();
        throw new Error(`Failed to parse JSON. Server responded with: ${text}`);
    }
}

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // State for Label Printing
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [productForLabel, setProductForLabel] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('user-token');
      const response = await fetch(`${API_BASE_URL}/api/products.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await safeJsonParse(response);
        throw new Error(errorData.message || 'Failed to fetch products');
      }
      
      const data = await safeJsonParse(response);
      
      if (data.products) {
        // Ensure price and stock are numbers
        const typedProducts = data.products.map((p: any) => ({
            ...p,
            price: parseFloat(p.price),
            stock: parseInt(p.stock, 10),
        }));
        setProducts(typedProducts);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching products',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    fetchProducts();
  }, [toast]);
  

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const token = sessionStorage.getItem('user-token');
        const response = await fetch(`${API_BASE_URL}/api/products.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ action: 'delete', id })
        });
        const data = await safeJsonParse(response);
        if (!response.ok) throw new Error(data.message || 'Failed to delete product');

        toast({ title: "Product Deleted", description: "The product has been removed."});
        fetchProducts(); // Refresh
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error deleting product',
          description: error.message,
        });
      }
    }
  };

  const openLabelDialog = (product: Product) => {
    setProductForLabel(product);
    setIsLabelModalOpen(true);
  }

  if (!isClient) {
    return null; // Don't render on the server
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>View, add, and manage your product stock.</CardDescription>
        </div>
        <Button onClick={() => router.push('/dashboard/inventory/add')}>
          <PlusCircle className="mr-2" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-right">₦{product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem asChild>
                            <Link href={`/dashboard/inventory/edit/${product.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit / Add Stock</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openLabelDialog(product)}>
                            <Printer className="mr-2 h-4 w-4" />
                            <span>Print Label</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No products found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    {productForLabel && (
      <ProductLabelModal 
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        product={productForLabel}
      />
    )}
    </>
  );
}

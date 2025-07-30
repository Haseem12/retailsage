
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Product } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Printer, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductLabelModal from './product-label-modal';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://arewaskills.com.ng/retaillab';

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // State for Edit Product Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [additionalStock, setAdditionalStock] = useState('');

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
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch products');
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
  
  const resetEditForm = () => {
    setEditProductName('');
    setEditProductPrice('');
    setAdditionalStock('');
    setCurrentStock('');
    setSelectedProduct(null);
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return;

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
          id: selectedProduct.id,
          name: editProductName,
          price: parseFloat(editProductPrice),
          stock: (parseInt(currentStock) || 0) + (parseInt(additionalStock, 10) || 0)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update product');
      
      toast({ title: "Product Updated", description: `${editProductName} has been updated.`});
      fetchProducts(); // Refresh products list
      resetEditForm();
      setIsEditDialogOpen(false);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating product',
        description: error.message,
      });
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const token = sessionStorage.getItem('user-token');
        const response = await fetch(`${API_BASE_URL}/api/products.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ action: 'delete', id })
        });
        const data = await response.json();
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
  
  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditProductName(product.name);
    setEditProductPrice(String(product.price));
    setCurrentStock(String(product.stock));
    setIsEditDialogOpen(true);
  }

  const openLabelDialog = (product: Product) => {
    setProductForLabel(product);
    setIsLabelModalOpen(true);
  }

  if (!isClient) {
    return null; // Don't render on the server
  }

  const EditProductDialog = () => (
     <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { setIsEditDialogOpen(isOpen); if(!isOpen) resetEditForm(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product / Add Stock</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">Name</Label>
            <Input id="edit-name" value={editProductName} onChange={e => setEditProductName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-price" className="text-right">Price (₦)</Label>
            <Input id="edit-price" type="number" value={editProductPrice} onChange={e => setEditProductPrice(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-stock" className="text-right">Current Stock</Label>
            <Input id="current-stock" type="number" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-stock" className="text-right">Add Stock</Label>
            <Input id="add-stock" type="number" placeholder="e.g. 50" value={additionalStock} onChange={e => setAdditionalStock(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleEditProduct}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

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
                           <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit / Add Stock</span>
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
        <EditProductDialog />
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

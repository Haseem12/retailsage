
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Product } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocalStorage } from '@/hooks/use-local-storage';
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

export default function InventoryManagement() {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const resetEditForm = () => {
    setEditProductName('');
    setEditProductPrice('');
    setAdditionalStock('');
    setCurrentStock('');
    setSelectedProduct(null);
  }

  const handleEditProduct = () => {
    if (!selectedProduct) return;

    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct.id) {
        return {
          ...p,
          name: editProductName,
          price: parseFloat(editProductPrice),
          stock: (parseInt(currentStock) || 0) + (parseInt(additionalStock, 10) || 0)
        }
      }
      return p;
    });

    setProducts(updatedProducts);
    resetEditForm();
    setIsEditDialogOpen(false);
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
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
              {products.length > 0 ? (
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

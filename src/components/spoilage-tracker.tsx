
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Product, SpoilageEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function SpoilageTracker() {
    const [spoilage, setSpoilage] = useLocalStorage<SpoilageEvent[]>('spoilage', []);
    const [products, setProducts] = useLocalStorage<Product[]>('products', []);
    const { toast } = useToast();

    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');

    const handleAddSpoilage = () => {
        if (!selectedProductId || !quantity) {
            toast({
                variant: 'destructive',
                title: "Missing Fields",
                description: "Please select a product and enter a quantity.",
            });
            return;
        }

        const product = products.find(p => p.id === parseInt(selectedProductId));
        if (!product) {
            toast({
                variant: 'destructive',
                title: "Product not found",
            });
            return;
        }
        
        const spoiledQuantity = parseInt(quantity);
        
        const newSpoilageEvent: SpoilageEvent = {
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            quantity: spoiledQuantity,
            reason: reason || 'Unspecified',
            date: new Date().toISOString(),
        };

        // Update spoilage records
        setSpoilage([...spoilage, newSpoilageEvent]);

        // Update product stock
        const updatedProducts = products.map(p => {
            if (p.id === product.id) {
                return { ...p, stock: Math.max(0, p.stock - spoiledQuantity) };
            }
            return p;
        });
        setProducts(updatedProducts);

        toast({
            title: "Spoilage Logged",
            description: `${spoiledQuantity} units of ${product.name} marked as spoiled.`,
        });

        // Reset form
        setSelectedProductId('');
        setQuantity('');
        setReason('');
    };
    
    const handleDeleteSpoilage = (id: number) => {
        if (confirm('Are you sure you want to delete this spoilage record? This will not add the stock back to inventory.')) {
            setSpoilage(spoilage.filter(s => s.id !== id));
            toast({
                title: "Record Deleted",
                description: "The spoilage record has been removed.",
            })
        }
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Log Spoilage</CardTitle>
                    <CardDescription>Record products that have been spoiled or damaged. This will deduct from inventory and be used in risk analysis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label>Product</Label>
                             <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.name} (Stock: {p.stock})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity Spoiled</Label>
                            <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g., 5" />
                        </div>
                        <Button onClick={handleAddSpoilage}>Log Spoilage</Button>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Spoilage History</CardTitle>
                    <CardDescription>A log of all recorded spoilage events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {spoilage.length > 0 ? (
                                [...spoilage].reverse().map(event => (
                                    <TableRow key={event.id}>
                                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{event.productName}</TableCell>
                                        <TableCell>{event.quantity}</TableCell>
                                        <TableCell>{event.reason}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSpoilage(event.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No spoilage records found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

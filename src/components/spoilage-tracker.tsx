
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, SpoilageEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Trash2, Loader2 } from "lucide-react";

const API_BASE_URL = 'https://sagheerplus.com.ng/retaillab';

async function safeJsonParse(response: Response) {
    try {
        return await response.json();
    } catch (error) {
        const text = await response.text();
        throw new Error(`Failed to parse JSON. Server responded with: ${text}`);
    }
}

export default function SpoilageTracker() {
    const [spoilage, setSpoilage] = useState<SpoilageEvent[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const token = sessionStorage.getItem('user-token');
        try {
            const [spoilageRes, productsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/spoilage.php?action=read`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/products.php?action=read`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const spoilageData = await safeJsonParse(spoilageRes);
            const productsData = await safeJsonParse(productsRes);

            if (!spoilageRes.ok) throw new Error(spoilageData.message || 'Failed to fetch spoilage data');
            if (!productsRes.ok) throw new Error(productsData.message || 'Failed to fetch products');

            setSpoilage(spoilageData.spoilage || []);
            setProducts(productsData.products || []);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error fetching data', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSpoilage = async () => {
        if (!selectedProductId || !quantity) {
            toast({
                variant: 'destructive',
                title: "Missing Fields",
                description: "Please select a product and enter a quantity.",
            });
            return;
        }

        try {
            const token = sessionStorage.getItem('user-token');
            const response = await fetch(`${API_BASE_URL}/api/spoilage.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    action: 'create',
                    product_id: parseInt(selectedProductId, 10),
                    quantity: parseInt(quantity, 10),
                    reason: reason || 'Unspecified'
                })
            });

            const data = await safeJsonParse(response);
            if (!response.ok) throw new Error(data.message || 'Failed to log spoilage');
            
            toast({
                title: "Spoilage Logged",
                description: `Spoilage for product has been recorded.`,
            });
            
            // Reset form and refetch data
            setSelectedProductId('');
            setQuantity('');
            setReason('');
            fetchData();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error logging spoilage', description: error.message });
        }
    };
    
    const handleDeleteSpoilage = async (id: number) => {
        if (confirm('Are you sure you want to delete this spoilage record? This will not add the stock back to inventory.')) {
            try {
                const token = sessionStorage.getItem('user-token');
                const response = await fetch(`${API_BASE_URL}/api/spoilage.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ action: 'delete', id })
                });

                const data = await safeJsonParse(response);
                if (!response.ok) throw new Error(data.message || 'Failed to delete record');

                toast({
                    title: "Record Deleted",
                    description: "The spoilage record has been removed.",
                });
                fetchData();
            } catch (error: any) {
                 toast({ variant: 'destructive', title: 'Error deleting record', description: error.message });
            }
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
                             <Select onValueChange={setSelectedProductId} value={selectedProductId} disabled={loading}>
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : spoilage.length > 0 ? (
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

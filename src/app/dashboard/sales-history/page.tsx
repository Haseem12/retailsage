
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Sale } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://sagheerplus.com.ng/retaillab';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('user-token');
        const response = await fetch(`${API_BASE_URL}/api/sales.php?action=read`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch sales');
        
        const typedSales = (data.sales || []).map((sale: any) => ({
          ...sale,
          total: parseFloat(sale.total),
          items: sale.items.map((item: any) => ({
            ...item,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity, 10),
          })),
        }));

        setSales(typedSales.sort((a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error fetching sales history', description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales History</CardTitle>
        <CardDescription>A detailed log of all completed transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            ) : sales.length > 0 ? (
              sales.map((sale, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
                  <TableCell>
                    {sale.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                  </TableCell>
                  <TableCell className="text-right font-medium">₦{sale.total.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  No sales history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

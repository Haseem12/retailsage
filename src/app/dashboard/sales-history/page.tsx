
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReceiptItem } from '@/components/receipt-modal';

interface Sale {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const savedSales = localStorage.getItem('sales');
    if (savedSales) {
      setSales(JSON.parse(savedSales).sort((a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, []);

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
            {sales.length > 0 ? (
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

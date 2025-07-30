
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { ReceiptItem } from '@/components/receipt-modal';

interface Sale {
  items: ReceiptItem[];
  subtotal: number;
  total: number;
  date: string;
}

interface ProductSale {
  name: string;
  unitsSold: number;
  revenue: number;
}

export default function SalesSummaryPage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [bestSelling, setBestSelling] = useState<ProductSale | null>(null);
  const [productSales, setProductSales] = useState<ProductSale[]>([]);

  useEffect(() => {
    const savedSales = localStorage.getItem('sales');
    if (savedSales) {
      const sales: Sale[] = JSON.parse(savedSales);
      
      const totalRev = sales.reduce((acc, sale) => acc + sale.total, 0);
      setTotalRevenue(totalRev);
      setTotalSales(sales.length);

      const productData: { [key: string]: { unitsSold: number, revenue: number } } = {};

      sales.forEach(sale => {
        sale.items.forEach(item => {
          if (!productData[item.name]) {
            productData[item.name] = { unitsSold: 0, revenue: 0 };
          }
          productData[item.name].unitsSold += item.quantity;
          productData[item.name].revenue += item.quantity * item.price;
        });
      });

      const productSalesArray = Object.entries(productData).map(([name, data]) => ({
        name,
        ...data
      }));
      
      setProductSales(productSalesArray);

      if(productSalesArray.length > 0) {
        const best = productSalesArray.reduce((prev, current) => (prev.unitsSold > current.unitsSold) ? prev : current);
        setBestSelling(best);
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₦{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalSales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Best Selling Item</CardTitle>
          </CardHeader>
          <CardContent>
            {bestSelling ? (
              <p className="text-3xl font-bold">{bestSelling.name}</p>
            ) : (
              <p className="text-muted-foreground">No sales data</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales by Product</CardTitle>
          <CardDescription>Revenue generated per product.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productSales}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

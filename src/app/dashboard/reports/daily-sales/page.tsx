
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarDays } from 'lucide-react';
import type { Sale, ReceiptItem } from '@/lib/types';

const API_BASE_URL = 'https://sagheerplus.com.ng/retaillab';

interface DailySales {
  [date: string]: {
    products: {
      [productName: string]: number; // productName: totalQuantity
    };
    totalRevenue: number;
  };
}

async function safeJsonParse(response: Response) {
    try {
        return await response.json();
    } catch (error) {
        const text = await response.text();
        throw new Error(`Failed to parse JSON. Server responded with: ${text}`);
    }
}

export default function DailyProductSalesPage() {
  const [dailySales, setDailySales] = useState<DailySales>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('user-token');
        const response = await fetch(`${API_BASE_URL}/api/sales.php?action=read`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await safeJsonParse(response);
            throw new Error(errorData.message || 'Failed to fetch sales');
        }

        const data = await safeJsonParse(response);
        const allSales: Sale[] = (data.sales || []).map((sale: any) => ({
          ...sale,
          total: parseFloat(sale.total),
          items: sale.items ? sale.items.map((item: any) => ({
            ...item,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity, 10),
          })) : [],
        }));
        
        const processedSales = processSales(allSales);
        setDailySales(processedSales);

      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error fetching sales data', description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [toast]);

  const processSales = (sales: Sale[]): DailySales => {
    const dailyData: DailySales = {};

    sales.forEach(sale => {
      const saleDate = new Date(sale.date).toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dailyData[saleDate]) {
        dailyData[saleDate] = { products: {}, totalRevenue: 0 };
      }

      dailyData[saleDate].totalRevenue += sale.total;
      
      sale.items.forEach((item: ReceiptItem) => {
        if (!dailyData[saleDate].products[item.name]) {
          dailyData[saleDate].products[item.name] = 0;
        }
        dailyData[saleDate].products[item.name] += item.quantity;
      });
    });

    return dailyData;
  };

  const sortedDates = Object.keys(dailySales).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Product Sales Report</CardTitle>
        <CardDescription>A summary of total units sold for each product, grouped by day.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <CalendarDays className="mx-auto h-12 w-12" />
            <p className="mt-4">No sales data found to generate a report.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {sortedDates.map(date => (
              <AccordionItem value={date} key={date}>
                <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                        <span className="font-semibold">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="text-muted-foreground">Total Revenue: ₦{dailySales[date].totalRevenue.toFixed(2)}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead className="text-right">Units Sold</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(dailySales[date].products).map(([productName, quantity]) => (
                        <TableRow key={productName}>
                          <TableCell>{productName}</TableCell>
                          <TableCell className="text-right">{quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

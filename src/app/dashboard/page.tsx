
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, ShoppingCart, Users, Percent } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionButtons from '@/components/action-buttons';
import type { ReceiptItem } from '@/components/receipt-modal';

interface Sale {
  items: ReceiptItem[];
  subtotal: number;
  total: number;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [shopType, setShopType] = useState<string | null>(null);
  const [stats, setStats] = useState({
    revenue: 0,
    salesCount: 0,
    newCustomers: 0, // This is a placeholder as we don't track customers
    conversionRate: 0, // This is a placeholder
  });

  useEffect(() => {
    const storedShopType = localStorage.getItem('shopType');
    setShopType(storedShopType);

    if (storedShopType === 'Fuel Station') {
      router.replace('/dashboard/fuel-management');
    } else {
      // Calculate today's stats from localStorage
      const savedSalesString = localStorage.getItem('sales');
      if (savedSalesString) {
        const savedSales: Sale[] = JSON.parse(savedSalesString);
        const today = new Date();
        const todaySales = savedSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getDate() === today.getDate() &&
                 saleDate.getMonth() === today.getMonth() &&
                 saleDate.getFullYear() === today.getFullYear();
        });

        const totalRevenue = todaySales.reduce((acc, sale) => acc + sale.total, 0);
        
        setStats({
          revenue: totalRevenue,
          salesCount: todaySales.length,
          newCustomers: Math.floor(todaySales.length / 5), // Simulating new customers
          conversionRate: 15.6, // Static placeholder
        });
      }
    }
  }, [router]);
  
  const statItems = [
    { title: 'Today\'s Revenue', value: `₦${stats.revenue.toFixed(2)}`, icon: TrendingUp, change: '+12.5%' },
    { title: 'Today\'s Sales', value: stats.salesCount, icon: ShoppingCart, change: '+8.2%' },
    { title: 'New Customers', value: stats.newCustomers, icon: Users, change: '-2.1%' },
    { title: 'Conversion Rate', value: '15.6%', icon: Percent, change: '+1.3%' },
  ];

  if (shopType === 'Fuel Station') {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <ActionButtons />
      <Card>
        <CardHeader>
          <CardTitle>Today's Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statItems.map((stat, index) => (
              <div key={stat.title} className="flex items-center gap-4">
                <div className="flex-grow">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change} vs yesterday
                    </p>
                  </div>
                </div>
                {index < statItems.length - 1 && (
                   <Separator orientation="vertical" className="h-16 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

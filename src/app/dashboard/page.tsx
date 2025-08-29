
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, ShoppingCart, Users, Percent, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionButtons from '@/components/action-buttons';
import type { Sale } from '@/lib/types';
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

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [shopType, setShopType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
      return;
    } 
    
    const fetchSalesStats = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('user-token');
        if (!token) {
          router.push('/login');
          return;
        }

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
          total: parseFloat(sale.total) || 0,
          items: sale.items ? sale.items.map((item: any) => ({
            ...item,
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity, 10) || 0,
          })) : [],
        }));

        const today = new Date();
        const todaySales = allSales.filter(sale => {
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

      } catch (error: any) {
         toast({ variant: 'destructive', title: 'Error fetching dashboard stats', description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesStats();
    
  }, [router, toast]);
  
  const statItems = [
    { title: 'Today\'s Revenue', value: `₦${stats.revenue.toFixed(2)}`, icon: TrendingUp, change: '+12.5%' },
    { title: 'Today\'s Sales', value: stats.salesCount, icon: ShoppingCart, change: '+8.2%' },
    { title: 'New Customers', value: stats.newCustomers, icon: Users, change: '-2.1%' },
    { title: 'Conversion Rate', value: '15.6%', icon: Percent, change: '+1.3%' },
  ];

  if (loading) {
     return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
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

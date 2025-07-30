
'use client';
import PosSystem from '@/components/pos-system';
import SalesChart from '@/components/sales-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [shopType, setShopType] = useState<string | null>(null);

  useEffect(() => {
    const storedShopType = localStorage.getItem('shopType');
    setShopType(storedShopType);

    if (storedShopType === 'Fuel Station') {
      router.replace('/dashboard/fuel-management');
    }
  }, [router]);
  
  const stats = [
    { title: 'Today\'s Revenue', value: '$12,405', icon: DollarSign, change: '+12.5%' },
    { title: 'Today\'s Sales', value: '842', icon: ShoppingCart, change: '+8.2%' },
    { title: 'New Customers', value: '34', icon: Users, change: '-2.1%' },
    { title: 'Conversion Rate', value: '15.6%', icon: TrendingUp, change: '+1.3%' },
  ];

  if (shopType === 'Fuel Station') {
    // Render a loader or nothing while redirecting
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} vs yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <PosSystem />
        </div>
        <div className="lg:col-span-1">
          <SalesChart />
        </div>
      </div>
    </div>
  );
}

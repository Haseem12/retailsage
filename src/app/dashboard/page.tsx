
'use client';
import PosSystem from '@/components/pos-system';
import SalesChart from '@/components/sales-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, ShoppingCart, Users, Percent } from 'lucide-react';
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
    { title: 'Today\'s Revenue', value: '₦1,240,500', icon: TrendingUp, change: '+12.5%' },
    { title: 'Today\'s Sales', value: '842', icon: ShoppingCart, change: '+8.2%' },
    { title: 'New Customers', value: '34', icon: Users, change: '-2.1%' },
    { title: 'Conversion Rate', value: '15.6%', icon: Percent, change: '+1.3%' },
  ];

  if (shopType === 'Fuel Station') {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Today's Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
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
                {index < stats.length - 1 && (
                   <Separator orientation="vertical" className="h-16 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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

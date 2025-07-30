
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ShoppingCart, BookOpen, BarChart2, DollarSign } from 'lucide-react';

const actions = [
  { label: 'Make Sale', icon: ShoppingCart, href: '/dashboard/make-sale' },
  { label: 'Inventory', icon: BookOpen, href: '/dashboard/inventory' },
  { label: 'Sales History', icon: BarChart2, href: '/dashboard/sales-history' },
  { label: 'Sales Summary', icon: DollarSign, href: '/dashboard/sales-summary' },
];

export default function ActionButtons() {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="flex flex-col items-center justify-center h-24 gap-2 text-center"
              onClick={() => router.push(action.href)}
            >
              <action.icon className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

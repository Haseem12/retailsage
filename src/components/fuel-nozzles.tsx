'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FUEL_NOZZLES, type FuelNozzle } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Flame, CheckCircle, XCircle, Clock } from 'lucide-react';

const statusMap = {
  Available: {
    icon: CheckCircle,
    color: 'bg-green-500',
    text: 'text-green-500',
  },
  'In Use': {
    icon: Flame,
    color: 'bg-yellow-500 animate-pulse',
    text: 'text-yellow-500',
  },
  'Out of Service': {
    icon: XCircle,
    color: 'bg-red-500',
    text: 'text-red-500',
  },
};

export default function FuelNozzles() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fuel Nozzle Status</CardTitle>
        <CardDescription>Live overview of all fuel pumps and their current status.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {FUEL_NOZZLES.map((nozzle: FuelNozzle) => {
          const StatusIcon = statusMap[nozzle.status].icon;
          return (
            <Card key={nozzle.id} className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">{nozzle.name}</CardTitle>
                 <span
                    className={cn(
                      'h-3 w-3 rounded-full',
                      statusMap[nozzle.status].color
                    )}
                 />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className={cn("h-6 w-6", statusMap[nozzle.status].text)} />
                    <p className="font-semibold">{nozzle.status}</p>
                </div>
                <Badge variant="outline">{nozzle.fuelType}</Badge>
                <div className="text-xl font-bold mt-2">${nozzle.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">Total Sales</p>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}

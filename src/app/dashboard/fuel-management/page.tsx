
'use client';
import FuelNozzles from '@/components/fuel-nozzles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const fuelSalesData = [
  { name: 'Mon', Regular: 2200, Premium: 1400, Diesel: 800 },
  { name: 'Tue', Regular: 1900, Premium: 1600, Diesel: 900 },
  { name: 'Wed', Regular: 2500, Premium: 1800, Diesel: 1100 },
  { name: 'Thu', Regular: 2300, Premium: 1700, Diesel: 1000 },
  { name: 'Fri', Regular: 3100, Premium: 2400, Diesel: 1500 },
  { name: 'Sat', Regular: 3500, Premium: 2800, Diesel: 1800 },
  { name: 'Sun', Regular: 3300, Premium: 2600, Diesel: 1600 },
];

export default function FuelManagementPage() {
  return (
    <div className="space-y-8">
      <FuelNozzles />
      <Card>
        <CardHeader>
          <CardTitle>Fuel Sales by Type</CardTitle>
          <CardDescription>Weekly sales volume per fuel grade.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={fuelSalesData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Bar dataKey="Regular" stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Premium" stackId="a" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Diesel" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

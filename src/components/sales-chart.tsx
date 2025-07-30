'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Mon', total: 4250 },
  { name: 'Tue', total: 3100 },
  { name: 'Wed', total: 5200 },
  { name: 'Thu', total: 2800 },
  { name: 'Fri', total: 6100 },
  { name: 'Sat', total: 7500 },
  { name: 'Sun', total: 6800 },
];

export default function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Sales Overview</CardTitle>
        <CardDescription>A summary of sales for the current week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₦${value}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number) => `₦${value.toFixed(2)}`}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

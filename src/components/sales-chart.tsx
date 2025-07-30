'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Mon', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Tue', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Wed', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Thu', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Fri', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Sat', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Sun', total: Math.floor(Math.random() * 5000) + 1000 },
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
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

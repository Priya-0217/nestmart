'use client';

import { Download, FileDown } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { formatPrice } from '@/lib/utils';
import { reportRevenue, salesBreakdown } from '../components/admin-data';

const colors = ['#1a56db', '#245fdd', '#f59e0b', '#8b5cf6', '#14b8a6'];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <section className="surface p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading title="Reports" subtitle="Revenue trends and sales breakdowns for executive-level review." />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full"><FileDown className="mr-2 h-4 w-4" />CSV</Button>
            <Button variant="outline" className="rounded-full"><Download className="mr-2 h-4 w-4" />PDF</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Revenue trends</h3>
          <p className="mt-1 text-sm text-foreground/60">Weekly revenue with channel mix context.</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => formatPrice(Number(value ?? 0))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1a56db" strokeWidth={3} />
                <Line type="monotone" dataKey="organic" name="Organic" stroke="#14b8a6" strokeWidth={2.5} />
                <Line type="monotone" dataKey="paid" name="Paid" stroke="#f59e0b" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Sales breakdown</h3>
          <p className="mt-1 text-sm text-foreground/60">Category share across the current reporting period.</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={salesBreakdown} dataKey="value" nameKey="label" innerRadius={64} outerRadius={104} paddingAngle={4}>
                    {salesBreakdown.map((entry, index) => <Cell key={entry.label} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {salesBreakdown.map((item, index) => (
                <div key={item.label} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  </div>
                  <p className="mt-1 text-sm text-foreground/60">{item.value}% of total sales</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
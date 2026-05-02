'use client';

import { Download, FileDown, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { formatPrice } from '@/lib/utils';
import { reportRevenue, salesBreakdown } from '../components/admin-data';

const colors = ['text-blue-600', 'text-indigo-600', 'text-amber-600', 'text-purple-600', 'text-teal-600'];
const bgs = ['bg-blue-100', 'bg-indigo-100', 'bg-amber-100', 'bg-purple-100', 'bg-teal-100'];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <section className="surface p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading title="Reports" subtitle="Simplified business overview and sales breakdowns." />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full"><FileDown className="mr-2 h-4 w-4" />CSV</Button>
            <Button variant="outline" className="rounded-full"><Download className="mr-2 h-4 w-4" />PDF</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Revenue overview</h3>
              <p className="text-sm text-foreground/60">Weekly performance summary</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            {reportRevenue.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border p-4 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-foreground/50">Channel Mix: {item.organic > item.paid ? 'Organic' : 'Paid'} Led</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{formatPrice(item.revenue)}</p>
                  <p className="text-xs text-green-600">Active Growth</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
              <PieChartIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Sales breakdown</h3>
              <p className="text-sm text-foreground/60">Category distribution</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {salesBreakdown.map((item, index) => (
              <div key={item.label} className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${bgs[index % bgs.length].replace('bg-', 'bg-')}`} />
                    <p className="font-medium text-foreground">{item.label}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{item.value}%</p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div 
                    className={`h-full ${bgs[index % bgs.length].replace('bg-', 'bg-').replace('-100', '-600')}`} 
                    style={{ width: `${item.value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
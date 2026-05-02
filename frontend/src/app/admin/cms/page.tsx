'use client';

import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionHeading } from '@/components/ui/section-heading';
import { bannerRows } from '../components/admin-data';

export default function CmsPage() {
  return (
    <div className="space-y-6">
      <section className="surface p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading title="CMS / Banners" subtitle="Manage hero banners, promo cards, and upload UI without backend logic." />
          <Button className="rounded-full"><Plus className="mr-2 h-4 w-4" />Add Banner</Button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Banner library</h3>
          <div className="mt-4 space-y-3">
            {bannerRows.map((banner) => (
              <div key={banner.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-muted/25 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-foreground">{banner.title}</p>
                  <p className="mt-1 text-sm text-foreground/60">{banner.placement}</p>
                </div>
                <Badge tone={banner.status === 'Live' ? 'success' : 'muted'}>{banner.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Upload / edit banner</h3>
          <div className="mt-4 space-y-4">
            <div className="rounded-3xl border border-dashed border-border bg-background/60 p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 font-medium text-foreground">Drop assets here</p>
              <p className="mt-1 text-sm text-foreground/60">PNG, JPG, WebP. Static upload UI only.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline">Choose file</Button>
              <Button>Save banner</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
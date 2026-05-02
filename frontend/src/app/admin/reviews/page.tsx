'use client';

import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { reviewRows } from '../components/admin-data';

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <section className="surface p-6 sm:p-7">
        <SectionHeading title="Reviews" subtitle="Moderate product feedback with approve and reject actions." />
      </section>

      <div className="grid gap-4">
        {reviewRows.map((review) => (
          <Card key={review.id} className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{review.product}</h3>
                  <Badge tone={review.status === 'Approved' ? 'success' : 'warning'}>{review.status}</Badge>
                </div>
                <div className="flex items-center gap-1 text-secondary">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-foreground/65">{review.text}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">By {review.author}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Approve</Button>
                <Button variant="danger" size="sm">Reject</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
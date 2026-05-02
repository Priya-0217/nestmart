'use client';

import { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SectionHeading } from '@/components/ui/section-heading';
import { AdminModal } from '../components/admin-modal';
import { categoryRows } from '../components/admin-data';

export default function CategoriesPage() {
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState('');

  return (
    <div className="space-y-6">
      <section className="surface p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading title="Categories" subtitle="Manage a nested category tree with quick add, edit, and delete actions." />
          <Button className="rounded-full" onClick={() => { setSelectedName(''); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </section>

      <div className="grid gap-4">
        {categoryRows.map((category) => (
          <Card key={category.id} className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                  <Badge tone="success">{category.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-foreground/60">/{category.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSelectedName(category.name); setOpen(true); }}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="danger" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {category.children.map((child) => (
                <div key={child} className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <p className="font-medium text-foreground">{child}</p>
                  <p className="text-xs text-foreground/55">Nested category</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <AdminModal
        open={open}
        title={selectedName ? `Edit ${selectedName}` : 'Add Category'}
        description="Build nested categories and control visibility from one form."
        onClose={() => setOpen(false)}
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button>Save category</Button>
          </>
        )}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Category name" defaultValue={selectedName} />
          <Input placeholder="Slug" defaultValue={selectedName.toLowerCase().replace(/\s+/g, '-')} />
          <Select defaultValue="published">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
          <Select defaultValue="root">
            <option value="root">Root category</option>
            <option value="living">Living Room</option>
            <option value="bedroom">Bedroom</option>
          </Select>
        </div>
      </AdminModal>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { bannerRows } from '../components/admin-data';
import { AdminMotionCard, AdminPageHeader, AdminToolbar } from '../components/admin-ui';

type Banner = (typeof bannerRows)[0] & {
  image?: string;
};

export default function CmsPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    image: '',
    placement: 'hero' as Banner['placement'],
    status: 'published' as 'published' | 'draft'
  });

  useEffect(() => {
    // CMS/Banners backend not implemented yet
    setBanners([]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(f);
    }
  };

  const handleSave = async () => {
    if (!form.title) {
      alert('Please enter a banner title.');
      return;
    }

    if (isEditing) {
      const idx = banners.findIndex((b) => b.id === form.title);
      if (idx >= 0) {
        setBanners((prev) =>
          prev.map((b, i) => (i === idx ? { ...b, title: form.title, placement: form.placement, status: form.status } : b))
        );
      }
    } else {
      const newBanner: Banner = {
        id: String(Date.now()),
        title: form.title,
        image: preview || form.image,
        placement: form.placement,
        status: form.status
      };
      setBanners((prev) => [newBanner, ...prev]);
    }

    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setForm({ title: '', image: '', placement: 'hero', status: 'published' });
    setFile(null);
    setPreview(null);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleEdit = (banner: Banner) => {
    setForm({
      title: banner.title,
      image: banner.image ?? '',
      placement: banner.placement || 'hero',
      status: banner.status as 'published' | 'draft'
    });
    setPreview(banner.image ?? null);
    setIsEditing(true);
    setIsOpen(true);
  };

  const filtered = banners.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Content Management System"
        subtitle="Create, manage, and schedule promotional banners and site content."
        actions={[
          {
            key: 'add',
            node: (
              <Button onClick={() => { resetForm(); setIsOpen(true); }} className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                New Banner
              </Button>
            )
          }
        ]}
      />

      <AdminToolbar search={search} onSearch={setSearch} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length ? (
          filtered.map((banner) => (
            <AdminMotionCard key={banner.id} className="overflow-hidden border-t-4 border-t-secondary">
              {banner.image && (
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground">{banner.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={banner.status === 'published' ? 'success' : 'default'} className="capitalize">
                    {banner.status}
                  </Badge>
                  <Badge tone="muted">{banner.placement}</Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(banner)} className="flex-1">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(banner.id)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AdminMotionCard>
          ))
        ) : (
          <AdminMotionCard className="col-span-full p-6 text-center text-foreground/60">
            No banners yet. Click "New Banner" to create one.
          </AdminMotionCard>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the banner details below.' : 'Add a new promotional banner to your site.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Banner Title *</p>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Summer Sale 2024"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Banner Image</p>
              <div className="mt-2 rounded-xl border-2 border-dashed border-border p-6 text-center">
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="mx-auto h-32 object-contain" />
                    <button
                      onClick={() => { setPreview(null); setFile(null); }}
                      className="absolute top-0 right-0 rounded-full bg-red-500 p-1 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <ImagePlus className="mx-auto h-8 w-8 text-foreground/40" />
                    <p className="mt-2 text-sm text-foreground/60">Click to upload or drag and drop</p>
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Placement</p>
              <Select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value as Banner['placement'] })}>
                <option value="hero">Hero Section</option>
                <option value="sidebar">Sidebar</option>
                <option value="footer">Footer</option>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Status</p>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'published' | 'draft' })}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
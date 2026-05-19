'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { categoriesApi, type CategoryTreeItem } from '@/lib/api';
import { AdminModal } from '../components/admin-modal';
import { AdminMotionCard, AdminPageHeader, AdminToolbar } from '../components/admin-ui';

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  status: 'Published' | 'Draft';
  parentId: string | null;
  parentName: string;
  children: string[];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'Published' as 'Published' | 'Draft',
    parentId: '' as string
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.tree();
      const flatList: CategoryItem[] = [];

      function flatten(items: CategoryTreeItem[], parentId: string | null = null, parentName = 'Root') {
        for (const item of items) {
          flatList.push({
            id: item._id,
            name: item.name,
            slug: item.slug,
            status: 'Published',
            parentId,
            parentName,
            children: item.children?.map(c => c.name) || []
          });
          if (item.children?.length) {
            flatten(item.children, item._id, item.name);
          }
        }
      }

      flatten(data.items);
      setCategories(flatList);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return categories;
    return categories.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.slug.toLowerCase().includes(query)
    );
  }, [categories, search]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      status: 'Published',
      parentId: ''
    });
    setModalOpen(true);
  };

  const openEdit = (category: CategoryItem) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      status: category.status,
      parentId: category.parentId || ''
    });
    setModalOpen(true);
  };

  const saveCategory = async () => {
    if (!formData.name || !formData.slug) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        parentId: formData.parentId || null
      };

      if (editingId) {
        await categoriesApi.update(editingId, payload);
      } else {
        await categoriesApi.create(payload);
      }
      await fetchCategories();
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Error saving category. Please check your data.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All subcategories will be unlinked.')) return;
    try {
      await categoriesApi.remove(id);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Error deleting category.');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Category & Subcategory Management"
        subtitle="Create and maintain your merchandising taxonomy with nested levels and publish states."
        actions={[{ 
          key: 'add', 
          node: (
            <Button className="rounded-full" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          ) 
        }]}
      />

      <AdminToolbar search={search} onSearch={setSearch} />

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-foreground/45">
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            Loading categories...
          </div>
        ) : filtered.length ? (
          filtered.map((category) => (
            <AdminMotionCard key={category.id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                    <Badge tone={category.status === 'Published' ? 'success' : 'warning'}>{category.status}</Badge>
                    <Badge tone="muted">Parent: {category.parentName}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground/60">/{category.slug}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(category)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteCategory(category.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              {category.children.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {category.children.map((child) => (
                    <div key={child} className="rounded-2xl border border-border bg-muted/25 px-4 py-3">
                      <p className="font-medium text-foreground">{child}</p>
                      <p className="text-xs text-foreground/55">Subcategory</p>
                    </div>
                  ))}
                </div>
              )}
            </AdminMotionCard>
          ))
        ) : (
          <div className="py-20 text-center text-foreground/45">No categories found.</div>
        )}
      </div>

      <AdminModal
        open={modalOpen}
        title={editingId ? 'Edit Category' : 'Create Category'}
        description="Use this form to manage category metadata and nested subcategories."
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={saveCategory} disabled={submitting || !formData.name || !formData.slug}>
              {submitting ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 py-2">
          <label className="text-sm font-medium md:col-span-2">
            Category Name
            <Input 
              value={formData.name} 
              onChange={(event) => {
                const nextName = event.target.value;
                setFormData(prev => ({
                  ...prev,
                  name: nextName,
                  slug: !editingId ? nextName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug
                }));
              }} 
              className="mt-1" 
              placeholder="e.g. Living Room"
            />
          </label>

          <label className="text-sm font-medium">
            Slug
            <Input 
              value={formData.slug} 
              onChange={(event) => setFormData(prev => ({ ...prev, slug: event.target.value }))} 
              className="mt-1" 
            />
          </label>

          <label className="text-sm font-medium">
            Status
            <Select 
              value={formData.status} 
              onChange={(event) => setFormData(prev => ({ ...prev, status: event.target.value as 'Published' | 'Draft' }))} 
              className="mt-1"
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </Select>
          </label>

          <label className="text-sm font-medium md:col-span-2">
            Parent Category
            <Select 
              value={formData.parentId} 
              onChange={(event) => setFormData(prev => ({ ...prev, parentId: event.target.value }))} 
              className="mt-1"
            >
              <option value="">Root (No Parent)</option>
              {categories
                .filter(c => c.id !== editingId)
                .map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))
              }
            </Select>
          </label>
        </div>
      </AdminModal>
    </div>
  );
}

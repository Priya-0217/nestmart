'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Pencil, Plus, RefreshCw, Trash2, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatPrice } from '@/lib/utils';
import { adminProductsApi, categoriesApi, uploadsApi, type AdminProduct, type CategoryTreeItem } from '@/lib/api';
import { AdminModal } from '../components/admin-modal';
import { AdminMotionCard, AdminPageHeader, AdminToolbar } from '../components/admin-ui';

type Product = AdminProduct;
type SortKey = 'title' | 'price' | 'stock';

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryTreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('title');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    brand: 'NestMart',
    images: [] as string[],
    features: [] as string[],
    isFeatured: false,
    variants: [] as any[]
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!editingProduct && formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [editingProduct, formData.title]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        adminProductsApi.list({ page: 1, limit: 80 }),
        categoriesApi.tree()
      ]);
      setProducts(productsData.items);
      setCategories(categoriesData.items);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const result = products.filter((product) => {
      const passesSearch =
        !normalized ||
        product.title.toLowerCase().includes(normalized) ||
        product.slug.toLowerCase().includes(normalized) ||
        product._id.toLowerCase().includes(normalized);
      const passesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return passesSearch && passesCategory;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'stock') return a.stock - b.stock;
      return a.title.localeCompare(b.title);
    });
  }, [categoryFilter, products, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getCategoryName = (id: string) => {
    const found = categories.find((c) => c._id === id);
    return found ? found.name : id;
  };

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, search, sortBy]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      slug: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      brand: 'NestMart',
      images: [],
      features: [],
      isFeatured: false,
      variants: []
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      slug: product.slug,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      description: (product as any).description || '',
      brand: (product as any).brand || 'NestMart',
      images: (product as any).images || [],
      features: (product as any).features || [],
      isFeatured: !!product.isFeatured,
      variants: (product as any).variants || []
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminProductsApi.remove(id);
      setProducts((prev) => prev.filter((item) => item._id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  useEffect(() => {
    if (!editingProduct && formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [editingProduct, formData.title]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    let updatedImages = [...formData.images];
    try {
      if (imageFile) {
        const upload = await uploadsApi.uploadProductImage(imageFile);
        updatedImages.push(upload.url);
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description,
        brand: formData.brand,
        images: updatedImages.length > 0 ? updatedImages : [],
        features: formData.features,
        isFeatured: formData.isFeatured,
        variants: formData.variants
      };

      if (editingProduct) {
        await adminProductsApi.update(editingProduct._id, payload);
      } else {
        await adminProductsApi.create(payload);
      }

      await fetchProducts();
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Unable to save product. Please verify the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} selected products?`)) return;

    await Promise.all(selectedIds.map((id) => adminProductsApi.remove(id).catch(() => null)));
    setProducts((prev) => prev.filter((item) => !selectedIds.includes(item._id)));
    setSelectedIds([]);
  };

  const handleCsvImport = async (file: File) => {
    const raw = await file.text();
    const [headerLine, ...rows] = raw.split(/\r?\n/).filter(Boolean);
    if (!headerLine) return;

    const headers = headerLine.split(',').map((value) => value.trim().toLowerCase());
    const index = {
      title: headers.indexOf('title'),
      slug: headers.indexOf('slug'),
      category: headers.indexOf('category'),
      price: headers.indexOf('price'),
      stock: headers.indexOf('stock'),
      isFeatured: headers.indexOf('isfeatured')
    };

    const payloads = rows
      .map((row) => row.split(',').map((cell) => cell.trim()))
      .map((cells) => ({
        title: cells[index.title] || '',
        slug: cells[index.slug] || '',
        category: cells[index.category] || categories[0]?._id || '',
        price: Number(cells[index.price] || 0),
        stock: Number(cells[index.stock] || 0),
        isFeatured: index.isFeatured >= 0 ? ['true', '1', 'yes'].includes((cells[index.isFeatured] || '').toLowerCase()) : false,
        brand: 'NestMart',
        description: 'Imported from CSV',
        images: [] as string[]
      }))
      .filter((item) => item.title && item.slug);

    await Promise.all(payloads.map((payload) => adminProductsApi.create(payload).catch(() => null)));
    await fetchProducts();
  };

  const exportCsv = () => {
    const rows = [
      ['title', 'slug', 'category', 'price', 'stock', 'isFeatured'],
      ...filteredProducts.map((item) => [
        item.title,
        item.slug,
        item.category,
        String(item.price),
        String(item.stock),
        item.isFeatured ? 'true' : 'false'
      ])
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nestmart-products-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Product Management"
        subtitle="Run full catalog operations with CRUD, bulk CSV import, image upload, and lifecycle controls."
        actions={[
          {
            key: 'refresh',
            node: (
              <Button variant="outline" onClick={fetchProducts} disabled={loading} className="rounded-full">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )
          },
          {
            key: 'export',
            node: (
              <Button variant="outline" onClick={exportCsv} className="rounded-full">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )
          },
          {
            key: 'import',
            node: (
              <Button variant="outline" onClick={() => csvInputRef.current?.click()} className="rounded-full">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            )
          },
          {
            key: 'add',
            node: (
              <Button onClick={handleOpenAdd} className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            )
          }
        ]}
      />

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleCsvImport(file).catch(() => alert('CSV import failed. Verify your columns and retry.'));
          }
          event.currentTarget.value = '';
        }}
      />

      <AdminToolbar
        search={search}
        onSearch={setSearch}
        right={(
          <>
            <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-w-[180px]">
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)} className="min-w-[150px]">
              <option value="title">Sort: Title</option>
              <option value="price">Sort: Price</option>
              <option value="stock">Sort: Stock</option>
            </Select>
          </>
        )}
      />

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            key="bulk-bar"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 dark:border-red-500/30 dark:bg-red-950/30"
          >
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected
            </p>
            <Button variant="danger" size="sm" onClick={handleBulkDelete} className="gap-2 rounded-full">
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminMotionCard className="overflow-hidden p-0">
        <div className="overflow-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border bg-muted/35 text-foreground/65">
              <tr>
                <th className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={paginatedProducts.length > 0 && paginatedProducts.every((item) => selectedIds.includes(item._id))}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedIds((prev) => Array.from(new Set([...prev, ...paginatedProducts.map((item) => item._id)])));
                      } else {
                        setSelectedIds((prev) => prev.filter((id) => !paginatedProducts.some((item) => item._id === id)));
                      }
                    }}
                  />
                </th>
                <th className="px-5 py-4 font-medium">Title</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium text-right">Price</th>
                <th className="px-5 py-4 font-medium text-center">Stock</th>
                <th className="px-5 py-4 font-medium text-center">Featured</th>
                <th className="px-5 py-4 font-medium text-center">Status</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-foreground/45">Loading products...</td>
                </tr>
              ) : paginatedProducts.length ? (
                paginatedProducts.map((product) => (
                  <tr key={product._id} className="border-t border-border/60 hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product._id)}
                        onChange={(event) => {
                          setSelectedIds((prev) =>
                            event.target.checked ? [...prev, product._id] : prev.filter((id) => id !== product._id)
                          );
                        }}
                      />
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{product.title}</td>
                    <td className="px-5 py-4 text-foreground/70">{getCategoryName(product.category)}</td>
                    <td className="px-5 py-4 text-right font-medium text-foreground">{formatPrice(product.price)}</td>
                    <td className="px-5 py-4 text-center text-foreground/70">{product.stock}</td>
                    <td className="px-5 py-4 text-center">
                      <Badge tone={product.isFeatured ? 'success' : 'muted'}>{product.isFeatured ? 'Yes' : 'No'}</Badge>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge tone={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'muted'}>
                        {product.stock > 10 ? 'Active' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl p-0" onClick={() => handleOpenEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0 text-red-500" onClick={() => handleDelete(product._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-foreground/45">No matching products.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-5 py-4 text-sm">
          <p className="text-foreground/60">
            Showing {Math.min(filteredProducts.length, (page - 1) * PAGE_SIZE + 1)} to {Math.min(filteredProducts.length, page * PAGE_SIZE)} of {filteredProducts.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
              Next
            </Button>
          </div>
        </div>
      </AdminMotionCard>

      <AdminModal
        open={modalOpen}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        description="Maintain catalog entries with pricing, stock, category, and media assets."
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="grid gap-4 py-2 md:grid-cols-2">
          <label className="text-sm font-medium md:col-span-2">
            Product title
            <input className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} required />
          </label>

          <label className="text-sm font-medium">
            Slug
            <input className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3" value={formData.slug} onChange={(event) => setFormData({ ...formData, slug: event.target.value })} required />
          </label>

          <label className="text-sm font-medium">
            Category
            <select className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3" value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            Price (INR)
            <input type="number" min="0" className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3" value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} required />
          </label>

          <label className="text-sm font-medium">
            Stock units
            <input type="number" min="0" className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3" value={formData.stock} onChange={(event) => setFormData({ ...formData, stock: event.target.value })} required />
          </label>

          <label className="text-sm font-medium md:col-span-2">
            Description
            <textarea className="mt-1 min-h-[100px] w-full rounded-xl border border-border bg-card px-3 py-2" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
          </label>

          <div className="md:col-span-2 space-y-3">
            <p className="text-sm font-medium">Images</p>
            <div className="flex flex-wrap gap-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative h-20 w-20 rounded-lg border overflow-hidden">
                  <img src={img} alt="Product" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                    onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed hover:bg-muted/50">
                <Plus className="h-5 w-5 text-foreground/40" />
                <span className="text-[10px] text-foreground/40">Add</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground/60">Or paste image URL:</p>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="https://example.com/image.jpg" 
                  className="h-9 flex-1 rounded-lg border border-border bg-card px-3 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const url = (e.target as HTMLInputElement).value.trim();
                      if (url) {
                        setFormData({ ...formData, images: [...formData.images, url] });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input[type="url"]') as HTMLInputElement;
                    const url = input?.value.trim();
                    if (url) {
                      setFormData({ ...formData, images: [...formData.images, url] });
                      input.value = '';
                    }
                  }}
                >
                  Add URL
                </Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Key Features (Checklist)</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
              >
                Add Feature
              </Button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    className="h-9 flex-1 rounded-lg border px-2 text-sm"
                    value={feature}
                    onChange={(e) => {
                      const next = [...formData.features];
                      next[idx] = e.target.value;
                      setFormData({ ...formData, features: next });
                    }}
                  />
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Variants (Colors/Sizes)</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData({
                    ...formData,
                    variants: [
                      ...formData.variants,
                      { id: Math.random().toString(36).substr(2, 9), name: '', price: formData.price, stock: formData.stock }
                    ]
                  })
                }
              >
                Add Variant
              </Button>
            </div>
            {formData.variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 border p-3 rounded-xl relative">
                <input
                  placeholder="Name (e.g. Red / XL)"
                  className="h-9 rounded-lg border px-2 text-xs"
                  value={v.name}
                  onChange={(e) => {
                    const next = [...formData.variants];
                    next[idx].name = e.target.value;
                    setFormData({ ...formData, variants: next });
                  }}
                />
                <input
                  placeholder="Price"
                  type="number"
                  className="h-9 rounded-lg border px-2 text-xs"
                  value={v.price}
                  onChange={(e) => {
                    const next = [...formData.variants];
                    next[idx].price = Number(e.target.value);
                    setFormData({ ...formData, variants: next });
                  }}
                />
                <input
                  placeholder="Stock"
                  type="number"
                  className="h-9 rounded-lg border px-2 text-xs"
                  value={v.stock}
                  onChange={(e) => {
                    const next = [...formData.variants];
                    next[idx].stock = Number(e.target.value);
                    setFormData({ ...formData, variants: next });
                  }}
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full border border-red-200"
                  onClick={() => setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== idx) })}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-3 text-sm font-medium md:col-span-2">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(event) => setFormData({ ...formData, isFeatured: event.target.checked })}
            />
            Mark this product as featured
          </label>
        </form>
      </AdminModal>
    </div>
  );
}

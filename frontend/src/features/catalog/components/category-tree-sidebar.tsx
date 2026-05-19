'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CategoryTreeItem } from '@/lib/api';
import { cn } from '@/lib/utils';

type CategoryTreeSidebarProps = {
  categories: CategoryTreeItem[];
  activeCategoryId?: string;
  onSelect: (categoryId: string) => void;
};

const STORAGE_KEY = 'nestmart-category-tree-open';

function getInitialOpenIds(categories: CategoryTreeItem[]) {
  return categories.filter((category) => category.children.length > 0).map((category) => category._id);
}

function flattenIds(categories: CategoryTreeItem[]): string[] {
  const ids: string[] = [];
  const walk = (items: CategoryTreeItem[]) => {
    items.forEach((item) => {
      ids.push(item._id);
      walk(item.children);
    });
  };
  walk(categories);
  return ids;
}

export function CategoryTreeSidebar({ categories, activeCategoryId, onSelect }: CategoryTreeSidebarProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const validIds = new Set(flattenIds(categories));
        setOpenIds(parsed.filter((id) => validIds.has(id)));
        return;
      }
    } catch {
      // ignore invalid persisted state
    }
    setOpenIds(getInitialOpenIds(categories));
  }, [categories]);

  const openSet = useMemo(() => new Set(openIds), [openIds]);

  function persist(next: string[]) {
    setOpenIds(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function toggle(id: string) {
    if (openSet.has(id)) {
      persist(openIds.filter((item) => item !== id));
      return;
    }
    persist([...openIds, id]);
  }

  function renderItems(items: CategoryTreeItem[], depth = 0) {
    return items.map((item) => {
      const active = item._id === activeCategoryId || item.slug === activeCategoryId;
      const expanded = openSet.has(item._id);
      const hasChildren = item.children.length > 0;

      return (
        <div key={item._id} className="space-y-1">
          <div
            className={cn(
              'flex items-center gap-2 rounded-2xl border px-3 py-2 transition',
              active ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:bg-muted',
              depth > 0 && 'ml-4'
            )}
            style={{ marginLeft: depth > 0 ? `${depth * 12}px` : undefined }}
          >
            <button
              type="button"
              className="focus-ring min-w-0 flex-1 text-left"
              onClick={() => onSelect(item._id)}
            >
              <span className="block text-sm font-semibold">{item.name}</span>
              <span className="block text-xs text-foreground/55">{hasChildren ? `${item.children.length} subcategories` : 'Browse products'}</span>
            </button>

            {hasChildren ? (
              <button
                type="button"
                className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground/70"
                onClick={() => toggle(item._id)}
                aria-label={expanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
              >
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : null}
          </div>

          {hasChildren && expanded ? <div className="space-y-1">{renderItems(item.children, depth + 1)}</div> : null}
        </div>
      );
    });
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="surface space-y-4 p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/45">Browse categories</p>
        <h3 className="mt-1 text-lg font-bold text-foreground">Category tree</h3>
      </div>
      <div className="space-y-2">{renderItems(categories)}</div>
    </section>
  );
}
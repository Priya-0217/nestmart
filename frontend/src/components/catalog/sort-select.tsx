import { Select } from '@/components/ui/select';

export type SortValue = 'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'newest';

type SortSelectProps = {
  value: SortValue;
  onChange: (value: SortValue) => void;
};

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-foreground/70">Sort:</span>
      <Select className="h-10 w-44 rounded-full" value={value} onChange={(event) => onChange(event.target.value as SortValue)}>
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating-desc">Top Rated</option>
        <option value="newest">Newest</option>
      </Select>
    </label>
  );
}

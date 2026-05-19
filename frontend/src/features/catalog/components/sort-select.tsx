import { Select } from '@/components/ui/select';

export type SortValue = 'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'newest';

type SortSelectProps = {
  value: SortValue;
  onChange: (value: SortValue) => void;
};

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm sm:flex-row sm:items-center sm:gap-2">
      <span className="whitespace-nowrap text-foreground/70">Sort by</span>
      <Select className="h-10 w-full rounded-full sm:w-44" value={value} onChange={(event) => onChange(event.target.value as SortValue)}>
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating-desc">Top Rated</option>
        <option value="newest">Newest</option>
      </Select>
    </label>
  );
}

import { Product } from '@/lib/types';
import { ProductTile } from '@/features/catalog/components/product-tile';
import { StaggerItem, StaggerList } from '@/components/motion/stagger-list';

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductTile product={product} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}

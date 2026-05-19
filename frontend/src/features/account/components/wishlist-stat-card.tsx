import { Heart } from 'lucide-react';
import { StatCard } from '@/features/account/components/stat-card';

export function WishlistStatCard({ count }: { count: number }) {
  return <StatCard label="Wishlist Items" value={String(count)} icon={<Heart className="h-4 w-4 text-primary" />} />;
}

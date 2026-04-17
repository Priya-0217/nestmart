'use client';

import { Heart } from 'lucide-react';
import { StatCard } from '@/components/account/stat-card';
import { useWishlistStore } from '@/store/wishlist-store';
import { selectWishlistCount } from '@/store/wishlist-store';

export function WishlistStatCard() {
  const count = useWishlistStore(selectWishlistCount);

  return <StatCard label="Wishlist Items" value={String(count)} icon={<Heart className="h-4 w-4 text-primary" />} />;
}

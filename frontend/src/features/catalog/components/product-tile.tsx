'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Eye, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PriceTag } from '@/components/ui/price-tag';
import { RatingStars } from '@/components/ui/rating-stars';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useToastStore } from '@/store/toast-store';
import { trackProductView } from '@/lib/personalization';
import { TRANSITION_FAST, TRANSITION_STANDARD } from '@/lib/motion';
import { ProductImage } from '@/components/ui/product-image';

import { useSession } from 'next-auth/react';
import { usersApi } from '@/lib/api';

type ProductTileProps = {
  product: Product;
};

export function ProductTile({ product }: ProductTileProps) {
  const { status } = useSession();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlistLocal = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.productIds.includes(product.id));
  const pushToast = useToastStore((state) => state.push);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const secondaryImage = product.images[1] ?? product.images[0];

  const handleAdd = () => {
    const variantId = product.variants?.[0]?.id ?? 'default';
    addItem(product.id, variantId, 1);
    setAdded(true);
    pushToast('Added to cart!', 'success');
    window.setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = async () => {
    // Always toggle local store for immediate UI update
    toggleWishlistLocal(product.id);

    // If authenticated, also sync with backend
    if (status === 'authenticated') {
      try {
        if (isWishlisted) {
          await usersApi.removeFromWishlist(product.id);
        } else {
          await usersApi.addToWishlist(product.id);
        }
      } catch (err) {
        console.error('Failed to sync wishlist with backend:', err);
      }
    }
  };

  return (
    <motion.div whileHover={{ y: -6, scale: 1.03 }} transition={TRANSITION_STANDARD} className="h-full">
      <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-card">
        <Link href={`/products/${product.slug || product.id}`} className="block shrink-0" onClick={() => trackProductView(product.id, product.category)}>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
            {!imageLoaded ? <div className="absolute inset-0 animate-pulse bg-muted" /> : null}
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              category={product.category}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-all duration-500 ease-in-out group-hover:scale-[1.06] group-hover:opacity-0"
              onLoad={() => setImageLoaded(true)}
            />
            <ProductImage
              src={secondaryImage}
              alt={`${product.name} alternate`}
              category={product.category}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover opacity-0 transition-all duration-500 ease-in-out group-hover:scale-[1.06] group-hover:opacity-100"
            />
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 bg-black/25 opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100">
              <motion.button
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-1 rounded-full bg-card/95 px-3 py-2 text-[11px] font-semibold text-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-glow min-h-[44px] min-w-[44px] justify-center"
                onClick={(event) => {
                  event.preventDefault();
                  handleAdd();
                }}
              >
                <ShoppingBag className="h-4 w-4 transition duration-300 group-hover:scale-110 group-hover:rotate-3" />
                <span className="hidden sm:inline">Add to Cart</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-1 rounded-full bg-card/95 px-3 py-2 text-[11px] font-semibold text-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-glow min-h-[44px] min-w-[44px] justify-center"
                onClick={(event) => {
                  event.preventDefault();
                  handleToggleWishlist();
                }}
              >
                <Heart className={`h-4 w-4 transition duration-300 group-hover:scale-110 group-hover:-rotate-6 ${isWishlisted ? 'fill-current text-secondary' : ''}`} />
                <span className="hidden sm:inline">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-1 rounded-full bg-card/95 px-3 py-2 text-[11px] font-semibold text-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-glow min-h-[44px] min-w-[44px] justify-center"
                onClick={(event) => {
                  event.preventDefault();
                  trackProductView(product.id, product.category);
                  router.push(`/products/${product.slug}`);
                }}
              >
                <Eye className="h-4 w-4 transition duration-300 group-hover:scale-110" />
                <span className="hidden sm:inline">Quick View</span>
              </motion.button>
            </div>
          </div>
        </Link>
        <div className="flex flex-1 flex-col space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge>{product.tag}</Badge>
            <span className="text-xs font-medium text-foreground/55">{product.category}</span>
          </div>
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="line-clamp-2 text-base font-semibold text-foreground">{product.name}</h3>
          </Link>
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={TRANSITION_FAST}>
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          </motion.div>
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...TRANSITION_FAST, delay: 0.05 }}>
              <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button size="sm" className="gap-1.5 transition-all duration-300 ease-out" onClick={handleAdd}>
                {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                {added ? 'Added' : 'Add'}
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

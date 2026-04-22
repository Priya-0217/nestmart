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

type ProductTileProps = {
  product: Product;
};

export function ProductTile({ product }: ProductTileProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.productIds.includes(product.id));
  const pushToast = useToastStore((state) => state.push);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const secondaryImage = product.images[1] ?? product.images[0];

  const handleAdd = () => {
    const firstVariant = product.variants[0];
    addItem(product.id, firstVariant.id, 1);
    setAdded(true);
    pushToast('Added to cart!', 'success');
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div whileHover={{ y: -6, scale: 1.03 }} transition={TRANSITION_STANDARD}>
      <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-card">
        <Link href={`/products/${product.slug}`} className="block" onClick={() => trackProductView(product.id, product.category)}>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
            {!imageLoaded ? <div className="absolute inset-0 animate-pulse bg-muted" /> : null}
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-all duration-500 ease-in-out group-hover:scale-[1.06] group-hover:opacity-0"
              onLoadingComplete={() => setImageLoaded(true)}
            />
            <ProductImage
              src={secondaryImage}
              alt={`${product.name} alternate`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover opacity-0 transition-all duration-500 ease-in-out group-hover:scale-[1.06] group-hover:opacity-100"
            />
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 bg-black/25 opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100">
              <motion.button
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-[11px] font-semibold text-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-glow"
                onClick={(event) => {
                  event.preventDefault();
                  handleAdd();
                }}
              >
                <ShoppingBag className="h-3.5 w-3.5 transition duration-300 group-hover:scale-110 group-hover:rotate-3" />
                Add to Cart
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-[11px] font-semibold text-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-glow"
                onClick={(event) => {
                  event.preventDefault();
                  toggleWishlist(product.id);
                }}
              >
                <Heart className={`h-3.5 w-3.5 transition duration-300 group-hover:scale-110 group-hover:-rotate-6 ${isWishlisted ? 'fill-current text-secondary' : ''}`} />
                {isWishlisted ? 'Wishlisted' : 'Wishlist'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-[11px] font-semibold text-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-glow"
                onClick={(event) => {
                  event.preventDefault();
                  trackProductView(product.id, product.category);
                  router.push(`/products/${product.slug}`);
                }}
              >
                <Eye className="h-3.5 w-3.5 transition duration-300 group-hover:scale-110" />
                Quick View
              </motion.button>
            </div>
          </div>
        </Link>
        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge>{product.tag}</Badge>
            <span className="text-xs text-foreground/55">{product.category}</span>
          </div>
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="line-clamp-2 text-base font-semibold text-foreground">{product.name}</h3>
          </Link>
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={TRANSITION_FAST}>
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          </motion.div>
          <div className="flex items-center justify-between gap-3">
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

export type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  image: string;
  tag: string;
};

export const products: Product[] = [
  {
    id: 'p1',
    title: 'Aurora Linen Sofa Set',
    category: 'Living Room',
    price: 799,
    originalPrice: 999,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200&auto=format&fit=crop',
    tag: 'Best Seller'
  },
  {
    id: 'p2',
    title: 'Nordic Pendant Lamp',
    category: 'Lighting',
    price: 129,
    originalPrice: 179,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1200&auto=format&fit=crop',
    tag: 'New'
  },
  {
    id: 'p3',
    title: 'Bamboo Organizer Bundle',
    category: 'Kitchen',
    price: 89,
    originalPrice: 119,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop',
    tag: 'Eco Pick'
  },
  {
    id: 'p4',
    title: 'Comfort Cloud Mattress',
    category: 'Bedroom',
    price: 649,
    originalPrice: 799,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1200&auto=format&fit=crop',
    tag: 'Hot Deal'
  }
];

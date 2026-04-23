import { Category, HomeFeature, Order, Product, Profile, Testimonial } from '@/lib/types';

export const products: Product[] = [
  {
    id: 'prod-1',
    slug: 'aurora-linen-sofa',
    name: 'Aurora Linen Sofa',
    category: 'Living Room',
    brand: 'NestMart Studio',
    tag: 'Best Seller',
    rating: 4.8,
    reviewCount: 214,
    price: 899,
    compareAtPrice: 1199,
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'Soft textured linen sofa with oversized cushions and solid oak legs.',
    longDescription:
      'The Aurora Linen Sofa is crafted for relaxed evenings and elevated interiors. The deep seat profile, breathable linen upholstery, and removable cushion covers make it the centerpiece of modern living spaces.',
    features: ['Stain-resistant linen blend', 'Kiln-dried hardwood frame', 'Removable zip covers', 'Tool-free assembly'],
    specs: { Width: '86 in', Depth: '37 in', Height: '32 in', Weight: '112 lb', Material: 'Linen blend + oak' },
    variants: [
      { id: 'v1-a', name: 'Olive Grove', color: 'Olive', colorHex: '#6f8b62', size: 'L', sku: 'SOFA-OLV-L', stock: 7, price: 899 },
      { id: 'v1-b', name: 'Clay Dune', color: 'Clay', colorHex: '#c19272', size: 'L', sku: 'SOFA-CLY-L', stock: 4, price: 899 },
      { id: 'v1-c', name: 'Mist Grey', color: 'Mist', colorHex: '#afb6be', size: 'L', sku: 'SOFA-MST-L', stock: 7, price: 949 }
    ]
  },
  {
    id: 'prod-2',
    slug: 'nordic-pendant-lamp',
    name: 'Nordic Pendant Lamp',
    category: 'Lighting',
    brand: 'North Vale',
    tag: 'New',
    rating: 4.6,
    reviewCount: 128,
    price: 149,
    compareAtPrice: 199,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'A soft-glow pendant lamp for dining spaces and kitchen islands.',
    longDescription:
      'The Nordic Pendant Lamp pairs brushed metal with a matte diffuser for warm ambient lighting. Height-adjustable cable and universal mount included.',
    features: ['Dimmable LED compatible', 'Adjustable hanging cable', 'Tool-less shade install', 'Two-year warranty'],
    specs: { Diameter: '14 in', Height: '10 in', Weight: '6 lb', Material: 'Aluminum + acrylic', Finish: 'Matte' },
    variants: [
      { id: 'v2-a', name: 'Sand Matte', color: 'Sand', colorHex: '#d6c7a3', size: 'One Size', sku: 'LAMP-SND-OS', stock: 12, price: 149 },
      { id: 'v2-b', name: 'Charcoal', color: 'Charcoal', colorHex: '#4f4f53', size: 'One Size', sku: 'LAMP-CHR-OS', stock: 15, price: 149 },
      { id: 'v2-c', name: 'Forest', color: 'Forest', colorHex: '#1f5d48', size: 'One Size', sku: 'LAMP-FRS-OS', stock: 13, price: 159 }
    ]
  },
  {
    id: 'prod-3',
    slug: 'bamboo-organizer-bundle',
    name: 'Bamboo Organizer Bundle',
    category: 'Kitchen',
    brand: 'Mellow Home',
    tag: 'Eco Pick',
    rating: 4.7,
    reviewCount: 392,
    price: 89,
    compareAtPrice: 119,
    stock: 62,
    images: [
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'A modular bundle of bamboo trays and utensil dividers.',
    longDescription:
      'Organize drawers and pantry shelves in minutes. This lightweight, moisture-resistant bamboo set snaps together in multiple layouts.',
    features: ['Expandable dividers', 'Naturally antimicrobial', 'Water-resistant finish', 'No plastic packaging'],
    specs: { Pieces: '12', Material: 'Natural bamboo', Weight: '5.2 lb', Warranty: '1 year', Finish: 'Food-safe oil' },
    variants: [
      { id: 'v3-a', name: 'Natural', color: 'Natural', colorHex: '#d5b88c', size: 'M', sku: 'ORG-NAT-M', stock: 31, price: 89 },
      { id: 'v3-b', name: 'Honey', color: 'Honey', colorHex: '#b9874d', size: 'M', sku: 'ORG-HON-M', stock: 15, price: 99 },
      { id: 'v3-c', name: 'Smoked', color: 'Smoked', colorHex: '#7a5a47', size: 'M', sku: 'ORG-SMK-M', stock: 16, price: 99 }
    ]
  },
  {
    id: 'prod-4',
    slug: 'cloud-comfort-mattress',
    name: 'Cloud Comfort Mattress',
    category: 'Bedroom',
    brand: 'DreamFold',
    tag: 'Hot Deal',
    imageContext: 'bedroom',
    rating: 4.5,
    reviewCount: 188,
    price: 699,
    compareAtPrice: 899,
    stock: 26,
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616594039964-9f9d8b4f2f0a?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'Cooling foam mattress with adaptive pressure zones.',
    longDescription:
      'Cloud Comfort blends responsive support and airflow channels for a cooler, balanced sleep surface. Ships compressed in a compact carton.',
    features: ['Multi-zone pressure relief', 'Cooling gel top layer', 'Motion isolation', '100-night trial'],
    specs: { Thickness: '12 in', Size: 'Queen', Cover: 'Breathable knit', Warranty: '10 years', Firmness: 'Medium' },
    variants: [
      { id: 'v4-a', name: 'Queen Medium', color: 'White', colorHex: '#ebedf0', size: 'L', sku: 'MAT-Q-MED', stock: 9, price: 699 },
      { id: 'v4-b', name: 'Queen Firm', color: 'White', colorHex: '#ebedf0', size: 'L', sku: 'MAT-Q-FRM', stock: 7, price: 749 },
      { id: 'v4-c', name: 'King Medium', color: 'White', colorHex: '#ebedf0', size: 'XL', sku: 'MAT-K-MED', stock: 10, price: 799 }
    ]
  },
  {
    id: 'prod-5',
    slug: 'solstice-dining-set',
    name: 'Solstice Dining Set',
    category: 'Dining',
    brand: 'Atelier North',
    tag: 'Editor Pick',
    rating: 4.9,
    reviewCount: 95,
    price: 1099,
    compareAtPrice: 1399,
    stock: 9,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1475856034131-7f6dff567fc4?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'Six-seat oak dining set with curved back chairs.',
    longDescription:
      'Designed around comfort and conversation, this set includes one solid oak table and six upholstered chairs with curved ergonomic backs.',
    features: ['Solid oak tabletop', 'Spill-resistant fabric', 'Easy assembly kit', 'Anti-scratch leg caps'],
    specs: { Table: '70 x 36 in', Seats: '6', Finish: 'Natural oak', Fabric: 'Performance weave', Weight: '168 lb' },
    variants: [
      { id: 'v5-a', name: 'Natural Oak', color: 'Oak', colorHex: '#be9869', size: 'XL', sku: 'DIN-NAT-XL', stock: 3, price: 1099 },
      { id: 'v5-b', name: 'Dark Walnut', color: 'Walnut', colorHex: '#6c4c33', size: 'XL', sku: 'DIN-WAL-XL', stock: 2, price: 1149 },
      { id: 'v5-c', name: 'Smoke Oak', color: 'Smoke', colorHex: '#7f776f', size: 'XL', sku: 'DIN-SMK-XL', stock: 4, price: 1129 }
    ]
  },
  {
    id: 'prod-6',
    slug: 'terra-rug',
    name: 'Terra Handloom Rug',
    category: 'Decor',
    brand: 'Fibrefield',
    tag: 'Trending',
    rating: 4.4,
    reviewCount: 257,
    price: 229,
    compareAtPrice: 299,
    stock: 54,
    images: [
      'https://images.unsplash.com/photo-1600607688066-890987f18a86?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617104551722-3b2d5136641c?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'Textured wool-blend rug with low-shed finish.',
    longDescription:
      'The Terra Handloom Rug introduces depth and warmth through handcrafted texture and a calming earthy palette suitable for high-traffic rooms.',
    features: ['Handloom construction', 'Low pile easy-care design', 'Cotton backing', 'Works with robot vacuums'],
    specs: { Size: '5 x 8 ft', Material: 'Wool blend', Pile: 'Low', Care: 'Spot clean', Origin: 'Handcrafted' },
    variants: [
      { id: 'v6-a', name: 'Sage Weave', color: 'Sage', colorHex: '#9fb3a4', size: 'L', sku: 'RUG-SAG-L', stock: 20, price: 229 },
      { id: 'v6-b', name: 'Sandstone', color: 'Sand', colorHex: '#c8b38f', size: 'L', sku: 'RUG-SND-L', stock: 18, price: 229 },
      { id: 'v6-c', name: 'Rust Loom', color: 'Rust', colorHex: '#9a5f46', size: 'L', sku: 'RUG-RST-L', stock: 16, price: 239 }
    ]
  },
  {
    id: 'prod-7',
    slug: 'horizon-work-desk',
    name: 'Horizon Work Desk',
    category: 'Office',
    brand: 'Gridline',
    tag: 'Work From Home',
    rating: 4.3,
    reviewCount: 84,
    price: 459,
    compareAtPrice: 589,
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1486946255434-2466348c2166?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'Compact wood-and-steel desk with cable management.',
    longDescription:
      'Built for focused work, the Horizon desk features integrated cable channels, soft-close drawer rails, and a matte powder-coated frame.',
    features: ['Integrated cable tray', 'Soft-close drawer', 'Matte anti-fingerprint top coat', 'Adjustable feet'],
    specs: { Width: '56 in', Depth: '24 in', Height: '30 in', Material: 'Oak veneer + steel', Load: '180 lb' },
    variants: [
      { id: 'v7-a', name: 'Natural', color: 'Natural', colorHex: '#c4a175', size: 'L', sku: 'DSK-NAT-L', stock: 6, price: 459 },
      { id: 'v7-b', name: 'Dark Oak', color: 'Dark Oak', colorHex: '#6f4f39', size: 'L', sku: 'DSK-DRK-L', stock: 4, price: 479 },
      { id: 'v7-c', name: 'Graphite', color: 'Graphite', colorHex: '#42484f', size: 'L', sku: 'DSK-GPH-L', stock: 4, price: 489 }
    ]
  },
  {
    id: 'prod-8',
    slug: 'aura-diffuser',
    name: 'Aura Ceramic Diffuser',
    category: 'Wellness',
    brand: 'Calm Ritual',
    tag: 'Bestselling Gift',
    rating: 4.8,
    reviewCount: 446,
    price: 59,
    compareAtPrice: 79,
    stock: 75,
    images: [
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'Ultrasonic ceramic diffuser with ambient light modes.',
    longDescription:
      'The Aura diffuser runs quietly for up to 10 hours and offers warm or cool glow modes to complement nighttime routines.',
    features: ['Whisper-quiet ultrasonic motor', 'Timer and auto shut-off', 'Warm and cool light modes', 'BPA-free water tank'],
    specs: { Capacity: '300 ml', Runtime: '10 hrs', Noise: '< 25 dB', Material: 'Ceramic + ABS', Power: 'USB-C' },
    variants: [
      { id: 'v8-a', name: 'Sand', color: 'Sand', colorHex: '#d3b38a', size: 'One Size', sku: 'DIF-SND-OS', stock: 28, price: 59 },
      { id: 'v8-b', name: 'Stone', color: 'Stone', colorHex: '#9da4ad', size: 'One Size', sku: 'DIF-STN-OS', stock: 22, price: 59 },
      { id: 'v8-c', name: 'Obsidian', color: 'Obsidian', colorHex: '#393d43', size: 'One Size', sku: 'DIF-OBS-OS', stock: 25, price: 65 }
    ]
  },
  {
    id: 'prod-9',
    slug: 'luna-side-table',
    name: 'Luna Side Table',
    category: 'Living Room',
    brand: 'Harborline',
    tag: 'New',
    rating: 4.6,
    reviewCount: 142,
    price: 139,
    compareAtPrice: 179,
    stock: 32,
    images: [
      'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502005097973-6a7082348e28?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1472224371017-08207f84aaae?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'Rounded oak side table with a hidden lower shelf.',
    longDescription:
      'The Luna Side Table pairs a soft edge profile with a discreet storage shelf. Use it beside sofas or beds for a clean, warm accent that still earns its keep.',
    features: ['Solid oak veneer', 'Hidden lower shelf', 'Soft matte finish', 'No-tool assembly'],
    specs: { Diameter: '20 in', Height: '18 in', Weight: '18 lb', Material: 'Oak veneer', Finish: 'Matte' },
    variants: [
      { id: 'v9-a', name: 'Natural Oak', color: 'Oak', colorHex: '#caa270', size: 'One Size', sku: 'TBL-NAT-OS', stock: 14, price: 139 },
      { id: 'v9-b', name: 'Smoked Oak', color: 'Smoked', colorHex: '#8b6c54', size: 'One Size', sku: 'TBL-SMK-OS', stock: 9, price: 149 },
      { id: 'v9-c', name: 'Black Oak', color: 'Black', colorHex: '#2f2f2f', size: 'One Size', sku: 'TBL-BLK-OS', stock: 9, price: 149 }
    ]
  },
  {
    id: 'prod-10',
    slug: 'mira-wall-shelf-set',
    name: 'Mira Wall Shelf Set',
    category: 'Office',
    brand: 'Studio Lane',
    tag: 'Editor Pick',
    rating: 4.5,
    reviewCount: 106,
    price: 189,
    compareAtPrice: 239,
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'Floating wall shelves with slim brackets for home offices.',
    longDescription:
      'The Mira set includes two floating shelves with powder-coated steel brackets. Cable cutouts keep tech tidy, and the slim profile fits compact work zones.',
    features: ['Powder-coated brackets', 'Cable cutouts', 'Includes mounting kit', 'Supports 45 lb per shelf'],
    specs: { Width: '36 in', Depth: '10 in', Weight: '14 lb', Material: 'Steel + MDF', Finish: 'Walnut' },
    variants: [
      { id: 'v10-a', name: 'Walnut', color: 'Walnut', colorHex: '#7a5538', size: 'M', sku: 'SHF-WAL-M', stock: 8, price: 189 },
      { id: 'v10-b', name: 'Ash', color: 'Ash', colorHex: '#d0b995', size: 'M', sku: 'SHF-ASH-M', stock: 7, price: 189 },
      { id: 'v10-c', name: 'Black', color: 'Black', colorHex: '#343434', size: 'M', sku: 'SHF-BLK-M', stock: 7, price: 199 }
    ]
  },
  {
    id: 'prod-11',
    slug: 'aria-floor-mirror',
    name: 'Aria Floor Mirror',
    category: 'Bedroom',
    brand: 'Reflecta',
    tag: 'Top Rated',
    imageContext: 'bedroom',
    rating: 4.7,
    reviewCount: 173,
    price: 259,
    compareAtPrice: 319,
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'Full-length floor mirror with a softly arched frame.',
    longDescription:
      'Aria brings depth and light into bedrooms or dressing areas. The lean-to frame is sturdy yet minimal, designed to open up smaller spaces.',
    features: ['Shatter-resistant glass', 'Powder-coated frame', 'Anti-tip hardware', 'Felt floor protectors'],
    specs: { Width: '24 in', Height: '68 in', Weight: '32 lb', Material: 'Aluminum + glass', Mount: 'Floor stand' },
    variants: [
      { id: 'v11-a', name: 'Soft Brass', color: 'Brass', colorHex: '#caa76a', size: 'L', sku: 'MIR-BRS-L', stock: 6, price: 259 },
      { id: 'v11-b', name: 'Matte Black', color: 'Black', colorHex: '#2c2c2c', size: 'L', sku: 'MIR-BLK-L', stock: 5, price: 269 },
      { id: 'v11-c', name: 'Cloud White', color: 'White', colorHex: '#e7e7e7', size: 'L', sku: 'MIR-WHT-L', stock: 5, price: 269 }
    ]
  },
  {
    id: 'prod-12',
    slug: 'sage-accent-chair',
    name: 'Sage Accent Chair',
    category: 'Living Room',
    brand: 'Evergreen',
    tag: 'New',
    rating: 4.6,
    reviewCount: 121,
    price: 329,
    compareAtPrice: 399,
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1499933374294-4584851497cc?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1400&auto=format&fit=crop'
    ],
    description: 'Sculpted lounge chair with a supportive curved back.',
    longDescription:
      'The Sage chair balances upright support with lounge-ready comfort. A plush seat cushion and angled arms make it a daily favorite for reading corners.',
    features: ['High-resilience foam', 'Powder-coated steel legs', 'Stain-resistant weave', 'Floor-safe caps'],
    specs: { Width: '30 in', Depth: '32 in', Height: '34 in', Weight: '38 lb', Material: 'Upholstery + steel', Seat: '18 in' },
    variants: [
      { id: 'v12-a', name: 'Sage', color: 'Sage', colorHex: '#8aa79a', size: 'L', sku: 'CHR-SAG-L', stock: 8, price: 329 },
      { id: 'v12-b', name: 'Ivory', color: 'Ivory', colorHex: '#e6dfd5', size: 'L', sku: 'CHR-IVO-L', stock: 6, price: 339 },
      { id: 'v12-c', name: 'Charcoal', color: 'Charcoal', colorHex: '#4b4f54', size: 'L', sku: 'CHR-CHR-L', stock: 6, price: 339 }
    ]
  }
];

function validateBedroomImages(list: Product[]) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  list.forEach((product) => {
    if (product.category === 'Bedroom' && product.imageContext !== 'bedroom') {
      console.warn(`[catalog] Bedroom product missing imageContext: ${product.name}`);
    }
  });
}

validateBedroomImages(products);

export const categories: Category[] = [
  { id: 'cat-1', name: 'Living Room', href: '/products?category=Living%20Room', image: products[0].images[0], count: 18 },
  { id: 'cat-2', name: 'Kitchen', href: '/products?category=Kitchen', image: products[2].images[0], count: 33 },
  { id: 'cat-3', name: 'Bedroom', href: '/products?category=Bedroom', image: products[3].images[0], count: 21 },
  { id: 'cat-4', name: 'Decor', href: '/products?category=Decor', image: products[5].images[0], count: 27 }
];

export const homeFeatures: HomeFeature[] = [
  { id: 'f-1', title: 'Fast Dispatch', description: 'Packed and shipped in under 24 hours from local fulfillment hubs.', icon: 'truck' },
  { id: 'f-2', title: 'Trusted Quality', description: 'Every product is curated and quality-checked by our design team.', icon: 'shield' },
  { id: 'f-3', title: 'Design-Led Selection', description: 'Mix-and-match collections built to make styling effortless.', icon: 'sparkles' },
  { id: 'f-4', title: 'Hassle-Free Returns', description: 'Changed your mind? Start a return in two clicks within 30 days.', icon: 'refresh' }
];

export const testimonials: Testimonial[] = [
  {
    id: 't-1',
    name: 'Maya R.',
    role: 'Interior Architect',
    quote: 'NestMart makes sourcing pieces for clients dramatically easier. The quality-to-price balance is exceptional.',
    rating: 5
  },
  {
    id: 't-2',
    name: 'Jordan T.',
    role: 'Remote Designer',
    quote: 'The furniture arrived fast and looked exactly like the photos. The packaging was genuinely premium.',
    rating: 5
  },
  {
    id: 't-3',
    name: 'Alina S.',
    role: 'Homeowner',
    quote: 'I finished my full apartment refresh in a weekend. The matching recommendations were spot on.',
    rating: 4
  }
];

export const profile: Profile = {
  name: 'Avery Bennett',
  email: 'avery@example.com',
  phone: '+1 (555) 810-1193',
  membership: 'Gold Member',
  defaultAddress: '1020 Riverfront Ave, Austin, TX 78701'
};

export const orders: Order[] = [
  { id: 'NM-1024', date: '2026-03-21', total: 948, status: 'Delivered', itemCount: 2 },
  { id: 'NM-0988', date: '2026-02-14', total: 229, status: 'Delivered', itemCount: 1 },
  { id: 'NM-0953', date: '2026-01-30', total: 149, status: 'Shipped', itemCount: 1 },
  { id: 'NM-0901', date: '2026-01-09', total: 59, status: 'Processing', itemCount: 1 }
];

export const wishlistProductIds = ['prod-6', 'prod-8', 'prod-2'];

export const heroSlides = [
  {
    id: 'h-1',
    eyebrow: 'Spring Living Edit',
    title: 'Design your home with furniture that feels intentional.',
    subtitle: 'Save up to 35% on curated essentials this week only.',
    ctaLabel: 'Shop Collections',
    ctaHref: '/products',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'h-2',
    eyebrow: 'Kitchen Upgrade',
    title: 'Create a calmer routine with modern kitchen systems.',
    subtitle: 'Free shipping on orders above INR 120.',
    ctaLabel: 'Explore Kitchen',
    ctaHref: '/products?category=Kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'h-3',
    eyebrow: 'Bedroom Comfort',
    title: 'Better sleep starts with smarter layering and texture.',
    subtitle: 'Bundle offers on bedding, rugs, and warm lighting.',
    ctaLabel: 'View Bedroom Picks',
    ctaHref: '/products?category=Bedroom',
    image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=1600&auto=format&fit=crop'
  }
];

export const homeCollections = [
  { id: 'c-1', title: 'Living Room Staples', productIds: ['prod-1', 'prod-6', 'prod-9', 'prod-12'] },
  { id: 'c-2', title: 'Workday Comfort', productIds: ['prod-7', 'prod-2', 'prod-10', 'prod-11'] },
  { id: 'c-3', title: 'Weekend Hosting', productIds: ['prod-5', 'prod-3', 'prod-4', 'prod-8'] }
];

export const shippingRates = {
  standard: 18,
  express: 35
};

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, limit);
}

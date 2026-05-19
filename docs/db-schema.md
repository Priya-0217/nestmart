# NestMart Database Schema

NestMart splits data between PostgreSQL (managed by Prisma) and MongoDB (managed by Mongoose).

- **PostgreSQL** — identity & auth: users, sessions, addresses, auth tokens. These have strong relational requirements and benefit from transactions.
- **MongoDB** — catalog & commerce: products, categories (tree), carts, orders, coupons, reviews, wishlists. These have flexible schemas and embedded documents.

Cross-store references: both `Cart.userId` and `Order.userId` (Mongo) store the Postgres `User.id` (cuid string). Same for `Review.userId` and `Wishlist.userId`.

The DBML block below renders at [dbdiagram.io](https://dbdiagram.io/d). Mongo collections are modelled as DBML tables using `Note` blocks where the shape is dynamic.

---

## DBML

```dbml
// ====================================================================
// POSTGRESQL (Prisma)
// ====================================================================

Table users {
  id varchar [pk]                    // cuid
  email varchar [unique, not null]
  email_verified timestamp
  password_hash varchar
  name varchar
  avatar_url varchar
  phone varchar
  role user_role [not null, default: 'customer']
  google_id varchar [unique]
  is_active boolean [not null, default: true]
  last_login_at timestamp
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null]

  Indexes {
    role
  }
}

Enum user_role {
  customer
  manager
  admin
}

Table addresses {
  id varchar [pk]
  user_id varchar [not null, ref: > users.id]
  label varchar
  full_name varchar [not null]
  phone varchar [not null]
  line1 varchar [not null]
  line2 varchar
  city varchar [not null]
  state varchar [not null]
  postal_code varchar [not null]
  country varchar [not null, default: 'IN']
  is_default boolean [not null, default: false]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null]

  Indexes {
    user_id
  }
}

Table sessions {
  id varchar [pk]
  user_id varchar [not null, ref: > users.id]
  refresh_token_hash varchar [unique, not null]  // sha256 of the refresh JWT
  user_agent varchar
  ip varchar
  expires_at timestamp [not null]
  revoked_at timestamp
  created_at timestamp [not null, default: `now()`]

  Indexes {
    user_id
    expires_at
  }
}

Table auth_tokens {
  id varchar [pk]
  user_id varchar [not null, ref: > users.id]
  purpose auth_token_purpose [not null]
  token_hash varchar [not null]          // sha256 of the token or OTP code
  expires_at timestamp [not null]
  consumed_at timestamp
  created_at timestamp [not null, default: `now()`]

  Indexes {
    (user_id, purpose)
    expires_at
  }
}

Enum auth_token_purpose {
  email_verification
  password_reset
  otp
}

// ====================================================================
// MONGODB (Mongoose) — documented as tables for diagramming.
// Foreign keys to Mongo collections are ObjectId; keys to Postgres
// users are cuid strings (Mongo field: userId: String).
// ====================================================================

Table products {
  _id objectid [pk]
  slug varchar [unique, not null]
  title varchar [not null]
  description text
  brand varchar
  category objectid [ref: > categories._id]
  subcategory objectid [ref: > categories._id]
  tags "string[]"
  images "string[]"
  price decimal [not null]
  compare_at_price decimal
  currency varchar [default: 'INR']
  stock int [not null, default: 0]
  sku varchar [unique]
  rating_average decimal [default: 0]
  rating_count int [default: 0]
  is_active boolean [default: true]
  is_featured boolean [default: false]
  attributes jsonb
  created_at timestamp
  updated_at timestamp

  Note: 'Text index on (title, description, tags). Secondary indexes on price, ratingAverage, createdAt, isActive, isFeatured, category, tags, brand.'
}

Table categories {
  _id objectid [pk]
  slug varchar [unique, not null]
  name varchar [not null]
  description text
  image varchar
  parent objectid [ref: > categories._id]  // self-referential tree
  is_active boolean [default: true]
  "order" int [default: 0]
  created_at timestamp
  updated_at timestamp
}

Table carts {
  _id objectid [pk]
  user_id varchar [unique, not null]   // -> postgres users.id
  items jsonb                          // [{productId, title, image, unitPrice, quantity}]
  coupon_code varchar
  currency varchar [default: 'INR']
  created_at timestamp
  updated_at timestamp
}

Table orders {
  _id objectid [pk]
  order_number varchar [unique, not null]
  user_id varchar [not null]           // -> postgres users.id
  items jsonb [not null]               // [{productId, title, image, unitPrice, quantity, subtotal}]
  subtotal decimal [not null]
  discount decimal [default: 0]
  shipping decimal [default: 0]
  tax decimal [default: 0]
  total decimal [not null]
  currency varchar [default: 'INR']
  coupon_code varchar
  status order_status [not null, default: 'pending']
  payment_method payment_method [not null]
  payment_status payment_status [not null, default: 'pending']
  stripe_payment_intent_id varchar
  razorpay_order_id varchar
  razorpay_payment_id varchar
  shipping_address jsonb [not null]
  tracking_number varchar
  cancel_reason text
  return_reason text
  placed_at timestamp
  paid_at timestamp
  shipped_at timestamp
  delivered_at timestamp
  created_at timestamp
  updated_at timestamp

  Indexes {
    user_id
    status
    payment_status
    (user_id, created_at)
  }
}

Enum order_status {
  pending
  paid
  shipped
  delivered
  cancelled
  refunded
  failed
  return_requested
  returned
}

Enum payment_method {
  stripe
  razorpay
  cod
}

Enum payment_status {
  pending
  paid
  failed
  refunded
}

Table coupons {
  _id objectid [pk]
  code varchar [unique, not null]
  description text
  type coupon_type [not null]
  value decimal [not null]
  min_order_amount decimal [default: 0]
  max_discount decimal
  usage_limit int
  per_user_limit int [default: 1]
  used_count int [default: 0]
  starts_at timestamp
  expires_at timestamp [not null]
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp
}

Enum coupon_type {
  percent
  fixed
}

Table reviews {
  _id objectid [pk]
  product_id objectid [not null, ref: > products._id]
  user_id varchar [not null]   // -> postgres users.id
  user_name varchar [not null]
  rating int [not null]
  title varchar
  body text [not null]
  verified_purchase boolean [default: false]
  status review_status [not null, default: 'pending']
  moderator_note text
  created_at timestamp
  updated_at timestamp

  Indexes {
    (product_id, user_id) [unique]
    status
    verified_purchase
  }
}

Enum review_status {
  pending
  approved
  rejected
}

Table wishlists {
  _id objectid [pk]
  user_id varchar [unique, not null]   // -> postgres users.id
  product_ids "objectid[]"              // -> products._id
  created_at timestamp
  updated_at timestamp
}
```

---

## Why the split

1. **Transactional integrity** for identity and password changes — Postgres with Prisma is the right tool. Refresh-token rotation uses a single transaction to revoke the old session and create the new one.
2. **Flexible product attributes** and large document growth (images, variants, reviews) — MongoDB handles this with less migration pain.
3. **Server-authoritative money** — all totals (subtotal, discount, shipping, tax, total) are re-computed on the backend and written into the Order. Cart docs store the raw inputs only.

## Indexing notes

- **Products**: a text index on `(title, description, tags)` powers the `?q=` search. Separate single-field indexes on `price`, `ratingAverage`, `createdAt` cover the common sort modes.
- **Orders**: compound `(userId, createdAt)` for the user's own "My Orders" page; single indexes on `status` and `paymentStatus` for admin filters.
- **Reviews**: unique compound `(productId, userId)` enforces one-review-per-product-per-user; `status` for the moderation queue.
- **Sessions**: indexed by `expiresAt` so a periodic sweep can delete expired rows cheaply.

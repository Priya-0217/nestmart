import { CartModel, type Cart } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";
import { BadRequest, NotFound } from "../utils/errors.js";
import { validateCoupon, type AppliedCoupon } from "./coupons.service.js";

const SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 49;
const TAX_RATE = 0.18;

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  coupon: AppliedCoupon | null;
}

async function getOrCreateCart(userId: string): Promise<Cart> {
  const existing = await CartModel.findOne({ userId });
  if (existing) return existing;
  return CartModel.create({ userId, items: [] });
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  const totals = await computeTotals(cart);
  return { cart: cart.toObject(), totals };
}

export async function addItem(userId: string, productId: string, quantity: number) {
  const product = await ProductModel.findById(productId);
  if (!product) throw NotFound("Product not found");
  if (!product.isActive) throw BadRequest("Product is not available");
  if (product.stock < quantity) throw BadRequest("Not enough stock");

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((i) => String(i.productId) === productId);
  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) throw BadRequest("Not enough stock");
    existing.quantity = newQty;
  } else {
    cart.items.push({
      productId: product._id,
      title: product.title,
      image: product.images[0],
      unitPrice: product.price,
      quantity,
    });
  }
  await cart.save();
  const totals = await computeTotals(cart);
  return { cart: cart.toObject(), totals };
}

export async function updateItem(userId: string, productId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => String(i.productId) === productId);
  if (!item) throw NotFound("Item not in cart");

  if (quantity === 0) {
    cart.items = cart.items.filter((i) => String(i.productId) !== productId);
  } else {
    const product = await ProductModel.findById(productId);
    if (!product) throw NotFound("Product not found");
    if (product.stock < quantity) throw BadRequest("Not enough stock");
    item.quantity = quantity;
  }
  await cart.save();
  const totals = await computeTotals(cart);
  return { cart: cart.toObject(), totals };
}

export async function removeItem(userId: string, productId: string) {
  const cart = await getOrCreateCart(userId);
  const before = cart.items.length;
  cart.items = cart.items.filter((i) => String(i.productId) !== productId);
  if (cart.items.length === before) throw NotFound("Item not in cart");
  await cart.save();
  const totals = await computeTotals(cart);
  return { cart: cart.toObject(), totals };
}

export async function applyCoupon(userId: string, code: string) {
  const cart = await getOrCreateCart(userId);
  const subtotal = cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  await validateCoupon(code, subtotal); // throws on invalid
  cart.couponCode = code.toUpperCase();
  await cart.save();
  const totals = await computeTotals(cart);
  return { cart: cart.toObject(), totals };
}

export async function removeCoupon(userId: string) {
  const cart = await getOrCreateCart(userId);
  cart.couponCode = null;
  await cart.save();
  const totals = await computeTotals(cart);
  return { cart: cart.toObject(), totals };
}

export async function clearCart(userId: string) {
  await CartModel.updateOne({ userId }, { $set: { items: [], couponCode: null } });
}

/** Server-authoritative totals. Clients should display these, never compute locally. */
export async function computeTotals(cart: Cart): Promise<CartTotals> {
  const itemCount = cart.items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  let coupon: AppliedCoupon | null = null;
  let discount = 0;
  if (cart.couponCode) {
    try {
      coupon = await validateCoupon(cart.couponCode, subtotal);
      discount = coupon.discount;
    } catch {
      coupon = null;
      discount = 0;
    }
  }
  const taxable = Math.max(0, subtotal - discount);
  const shipping = subtotal === 0 ? 0 : subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + shipping + tax) * 100) / 100;

  return {
    itemCount,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shipping,
    tax,
    total,
    currency: cart.currency,
    coupon,
  };
}

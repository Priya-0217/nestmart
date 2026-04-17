import { products } from '../data/products.js';

export function getProducts(req, res) {
  const { category } = req.query;
  const filtered = category ? products.filter((p) => p.category.toLowerCase() === String(category).toLowerCase()) : products;
  return res.json({ count: filtered.length, items: filtered });
}

export function getProductById(req, res) {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json(product);
}

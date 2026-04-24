import { CategoryModel } from "../models/category.model.js";
import { NotFound } from "../utils/errors.js";

interface CategoryNode {
  _id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
  parent: string | null;
  isActive: boolean;
  order: number;
  children: CategoryNode[];
}

/** Returns the full category tree (roots with nested children). */
export async function listTree(): Promise<CategoryNode[]> {
  const flat = await CategoryModel.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
  const byId = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const c of flat) {
    byId.set(String(c._id), {
      _id: String(c._id),
      slug: c.slug,
      name: c.name,
      description: c.description ?? "",
      image: c.image ?? undefined,
      parent: c.parent ? String(c.parent) : null,
      isActive: c.isActive,
      order: c.order,
      children: [],
    });
  }

  for (const node of byId.values()) {
    if (node.parent && byId.has(node.parent)) {
      byId.get(node.parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function getById(id: string) {
  const cat = await CategoryModel.findById(id).lean();
  if (!cat) throw NotFound("Category not found");
  return cat;
}

export async function create(input: Record<string, unknown>) {
  return CategoryModel.create(input);
}

export async function update(id: string, input: Record<string, unknown>) {
  const updated = await CategoryModel.findByIdAndUpdate(id, input, { new: true });
  if (!updated) throw NotFound("Category not found");
  return updated;
}

export async function remove(id: string) {
  const deleted = await CategoryModel.findByIdAndDelete(id);
  if (!deleted) throw NotFound("Category not found");
  return { ok: true };
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/product';
import { OrderModel } from '@/models/order';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();

  const [products, orders, revenueAggregation] = await Promise.all([
    ProductModel.countDocuments(),
    OrderModel.countDocuments(),
    OrderModel.aggregate([{ $group: { _id: null, revenue: { $sum: '$total' } } }])
  ]);

  const revenue = revenueAggregation[0]?.revenue ?? 0;

  return NextResponse.json({ products, orders, revenue });
}

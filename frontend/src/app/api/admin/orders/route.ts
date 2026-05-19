import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { OrderModel } from '@/models/order';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { customer, total, status } = body;

  if (!customer || typeof total !== 'number') {
    return NextResponse.json({ error: 'Customer and total are required' }, { status: 400 });
  }

  const order = await OrderModel.create({
    customer,
    total,
    status: status || 'pending'
  });

  return NextResponse.json(order, { status: 201 });
}

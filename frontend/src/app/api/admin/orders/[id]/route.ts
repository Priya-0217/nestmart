import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { OrderModel, orderStatuses } from '@/models/order';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status : '';
  if (!orderStatuses.includes(status as (typeof orderStatuses)[number])) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const order = await OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

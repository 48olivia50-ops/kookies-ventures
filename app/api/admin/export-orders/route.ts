import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await verifySession();
  if (!session?.isAuth || session.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: any = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: { include: { product: true } }
    }
  });

  const headers = ['Order ID', 'Date', 'Customer', 'Total', 'Status', 'Items', 'Payment Method'];
  const rows = orders.map(order => [
    order.id,
    new Date(order.createdAt).toLocaleString(),
    order.user.email,
    order.total.toFixed(2),
    order.status,
    order.items.map(i => `${i.product.name} (x${i.quantity})`).join('; '),
    order.paymentMethod
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="orders-export-${Date.now()}.csv"`
    }
  });
}

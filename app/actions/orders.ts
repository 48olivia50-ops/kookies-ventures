'use server';

import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

type CartItem = { id: string; name: string; price: number; quantity: number };

export async function placeOrder(prevState: any, formData: FormData) {
  const session = await verifySession();
  if (!session?.isAuth || !session.userId) {
    return { error: 'You must be logged in to place an order.' };
  }

  const paymentMethod = formData.get('paymentMethod') as string;
  const tenantSlug = formData.get('tenantSlug') as string;
  const itemsJson = formData.get('items') as string;

  let items: CartItem[] = [];
  try { items = JSON.parse(itemsJson); } catch { return { error: 'Invalid cart data.' }; }

  if (!items.length) return { error: 'Your cart is empty.' };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return { error: 'Invalid shop.' };

  const orderData: any = {
    total,
    status: 'PENDING',
    paymentMethod,
    isRead: false,
    userId: session.userId,
    tenantId: tenant.id,
    items: {
      create: await Promise.all(items.map(async (item) => {
        const product = await prisma.product.findUnique({ where: { id: item.id } });
        return {
          quantity: item.quantity,
          price: item.price,
          productId: item.id,
        };
      }))
    }
  };

  if (paymentMethod === 'PAY_ON_DELIVERY') {
    orderData.deliveryAddress = formData.get('address') as string;
    orderData.deliveryCity = formData.get('city') as string;
    orderData.deliveryPhone = formData.get('phone') as string;
  } else if (paymentMethod === 'MOBILE_MONEY') {
    orderData.mobileMoneyNumber = formData.get('mobileNumber') as string;
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Check stock for all items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
          select: { stock: true, name: true }
        });

        if (!product) {
          throw new Error(`Product ${item.name} not found.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }

        // 2. Reduce stock
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 3. Create order
      return await tx.order.create({ data: orderData });
    });

    // Return redirect URL instead of calling redirect()
    return { success: true, redirectUrl: `/order-confirmation/${order.id}` };
  } catch (error: any) {
    console.error('Order placement failed:', error);
    return { error: error.message || 'Failed to place order.' };
  }
}

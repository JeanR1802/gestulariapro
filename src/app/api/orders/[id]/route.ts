import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } } // Actualizamos el tipo para reflejar la realidad
) {
  try {
    const session = await getServerSession(authOptions);
    
    // --- CAMBIO DEFINITIVO: Usamos 'await' para resolver la promesa de los params ---
    const resolvedParams = await context.params;
    const orderId = resolvedParams.id;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { status } = await request.json();

    if (!status || !Object.values(OrderStatus).includes(status)) {
        return NextResponse.json({ error: 'El estado proporcionado no es válido.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { store: { select: { id: true } } },
    });

    if (!user?.store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    const orderToUpdate = await prisma.order.findFirst({
        where: {
            id: orderId,
            storeId: user.store.id,
        }
    });

    if (!orderToUpdate) {
        return NextResponse.json({ error: 'Pedido no encontrado o no tienes permiso para modificarlo' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status },
    });

    return NextResponse.json({ message: 'Estado del pedido actualizado', order: updatedOrder });

  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
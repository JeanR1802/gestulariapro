import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

// PATCH - Actualizar estado de pedido
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Hacer await de params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { status } = await request.json()

    if (!status || !['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true }
    })

    if (!user?.store) {
      return NextResponse.json({ error: 'No tienes una tienda' }, { status: 400 })
    }

    const updatedOrder = await prisma.order.update({
      where: { 
        id,
        storeId: user.store.id 
      },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Pedido actualizado exitosamente',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error al actualizar pedido:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
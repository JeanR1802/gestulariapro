import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// --- FUNCIÓN GET CORREGIDA ---
export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Corregimos el manejo de params
        const resolvedParams = await context.params;
        const productId = resolvedParams.id;
        
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ product });

    } catch (error) {
        console.error('Error al obtener el producto:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// --- FUNCIÓN PUT CORREGIDA ---
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await context.params;
    const productId = resolvedParams.id;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { store: { select: { id: true } } },
    });

    if (!user?.store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    const productToUpdate = await prisma.product.findFirst({
        where: { id: productId, storeId: user.store.id }
    });

    if (!productToUpdate) {
        return NextResponse.json({ error: 'Producto no encontrado o sin permisos para editar' }, { status: 404 });
    }

    const { name, description, price, image, isActive } = await request.json();

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 });
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { name, description, price, image, isActive },
    });

    return NextResponse.json({ message: 'Producto actualizado exitosamente', product: updatedProduct });

  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// --- FUNCIÓN DELETE CORREGIDA ---
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await context.params;
    const productId = resolvedParams.id;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { store: { select: { id: true } } },
    });

    if (!user?.store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    const product = await prisma.product.findFirst({
        where: { id: productId, storeId: user.store.id }
    });

    if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado o no tienes permiso para eliminarlo' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: 'Producto eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
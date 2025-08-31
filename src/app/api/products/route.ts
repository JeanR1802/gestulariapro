// src/app/api/products/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

// --- LA FUNCIÓN POST QUE YA TENÍAMOS ---
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { name, description, price, image } = await request.json()

    if (!name || !price) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 })
    }
    if (isNaN(price) || price < 0) {
        return NextResponse.json({ error: 'El precio debe ser un número positivo' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true },
    })

    if (!user || !user.store) {
      return NextResponse.json({ error: 'No se encontró una tienda para este usuario' }, { status: 404 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        image: image || null,
        storeId: user.store.id,
      },
    })

    return NextResponse.json({ message: 'Producto creado exitosamente', product })
  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// --- ¡NUEVA FUNCIÓN GET PARA LISTAR PRODUCTOS! ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { store: { select: { id: true } } },
    });

    if (!user?.store) {
      return NextResponse.json({ products: [] }); // No tiene tienda, devuelve array vacío
    }

    const products = await prisma.product.findMany({
      where: { storeId: user.store.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
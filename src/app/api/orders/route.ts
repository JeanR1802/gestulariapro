import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

// --- FUNCIÓN PARA CREAR UN NUEVO PEDIDO (DESDE LA TIENDA PÚBLICA) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId, customerName, customerEmail, customerPhone, notes, items } = body;

    // Validaciones de datos de entrada
    if (!storeId || !customerName || !customerEmail || !items || items.length === 0) {
      return NextResponse.json({ error: 'Faltan datos requeridos para crear el pedido' }, { status: 400 });
    }

    // Se obtienen los IDs de los productos para verificarlos en la base de datos
    const productIds = items.map((item: { productId: string }) => item.productId);
    const productsFromDb = await prisma.product.findMany({
      where: { 
        id: { in: productIds }, 
        storeId: storeId // Se asegura que los productos pertenezcan a la tienda correcta
      },
    });

    // Se verifica que todos los productos solicitados existan
    if (productsFromDb.length !== items.length) {
      return NextResponse.json({ error: 'Alguno de los productos no fue encontrado o no pertenece a esta tienda.' }, { status: 404 });
    }

    // Se calcula el total en el backend para evitar manipulación en el frontend
    let total = 0;
    const orderItemsData = items.map((item: { productId: string, quantity: number }) => {
        const product = productsFromDb.find(p => p.id === item.productId);
        if (!product) {
            // Esta comprobación es redundante gracias a la validación anterior, pero es una buena práctica de seguridad
            throw new Error("Producto no encontrado durante el cálculo del total.");
        }
        total += Number(product.price) * item.quantity;
        return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price, // Se guarda el precio al momento de la compra
        };
    });

    // Se crea el pedido en la base de datos junto con sus items relacionados
    const newOrder = await prisma.order.create({
        data: {
            storeId,
            customerName,
            customerEmail,
            customerPhone: customerPhone || null,
            notes: notes || null,
            total,
            items: { 
                create: orderItemsData 
            },
        },
    });

    return NextResponse.json({ message: 'Pedido creado exitosamente', order: newOrder }, { status: 201 });

  } catch (error) {
    console.error('Error al crear el pedido:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// --- FUNCIÓN PARA LISTAR TODOS LOS PEDIDOS (PARA EL DASHBOARD DEL EMPRENDEDOR) ---
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // Se busca al usuario para obtener el ID de su tienda
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { store: { select: { id: true } } },
        });

        if (!user?.store) {
            return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
        }

        // Se obtienen todos los pedidos que coincidan con el ID de la tienda
        const orders = await prisma.order.findMany({
            where: { storeId: user.store.id },
            include: {
                items: {
                    include: {
                        product: true, // Incluye la información de cada producto en el item
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Muestra los pedidos más recientes primero
            },
        });

        return NextResponse.json({ orders });

    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
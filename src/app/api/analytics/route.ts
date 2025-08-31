// src/app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { OrderStatus } from '@prisma/client';

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
            return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
        }

        const orders = await prisma.order.findMany({
            where: { 
                storeId: user.store.id,
                // Consideramos solo pedidos que no estén cancelados para las métricas
                status: { not: OrderStatus.CANCELLED }
            },
            include: { items: { include: { product: true } } },
        });

        // 1. Cálculo de Métricas Clave
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
        const salesCount = orders.length;
        const averageOrderValue = salesCount > 0 ? totalRevenue / salesCount : 0;

        // 2. Datos para el Gráfico de Ventas (agrupados por día)
        const salesByDay = orders.reduce((acc, order) => {
            const date = new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            acc[date] = (acc[date] || 0) + Number(order.total);
            return acc;
        }, {} as Record<string, number>);
        
        const chartData = Object.entries(salesByDay).map(([name, total]) => ({ name, total })).reverse();

        // 3. Cálculo de Top Productos
        const productSales = orders.flatMap(order => order.items).reduce((acc, item) => {
            acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);

        const topProductsData = await prisma.product.findMany({
            where: { id: { in: Object.keys(productSales) } },
            select: { id: true, name: true }
        });
        
        const topProducts = topProductsData.map(product => ({
            name: product.name,
            count: productSales[product.id],
        })).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5

        return NextResponse.json({
            totalRevenue,
            salesCount,
            averageOrderValue,
            chartData,
            topProducts,
        });

    } catch (error) {
        console.error('Error al calcular analíticas:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
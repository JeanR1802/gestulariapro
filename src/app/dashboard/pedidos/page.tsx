// src/app/dashboard/pedidos/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@prisma/client'; // Importamos el tipo para usarlo

// Definimos los tipos para tener un código más limpio
type Product = {
    name: string;
};

type OrderItem = {
    id: string;
    quantity: number;
    price: number;
    product: Product;
};

type Order = {
    id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: OrderStatus; // Usamos el tipo importado de Prisma
    createdAt: string;
    items: OrderItem[];
};

export default function PedidosPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders');
                if (!response.ok) {
                    throw new Error('No se pudieron cargar los pedidos.');
                }
                const data = await response.json();
                setOrders(data.orders);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // --- ¡NUEVA FUNCIÓN PARA CAMBIAR EL ESTADO! ---
    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        // Actualización optimista: Cambiamos el estado en la UI inmediatamente
        setOrders(currentOrders => 
            currentOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                // Si falla, revertimos el cambio en la UI y mostramos un error
                throw new Error('No se pudo actualizar el estado.');
            }
            // La actualización fue exitosa en el backend
        } catch (err) {
            alert('Hubo un error al actualizar el pedido. Por favor, recarga la página.');
            // Opcional: podrías volver a llamar a fetchOrders() para sincronizar con el estado real
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-800 mb-4">
                        &larr; Volver al Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Historial de Pedidos</h1>
                    <p className="text-gray-600 mt-1">Aquí puedes ver y gestionar todas las ventas de tu tienda.</p>
                </div>
            </div>

            {/* Lista de Pedidos */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow">
                    {isLoading && <p className="p-6 text-center text-gray-500">Cargando pedidos...</p>}
                    {error && <p className="p-6 text-center text-red-500">{error}</p>}
                    {!isLoading && !error && orders.length === 0 && (
                        <p className="p-6 text-center text-gray-500">Aún no has recibido ningún pedido.</p>
                    )}
                    {!isLoading && !error && orders.length > 0 && (
                        <ul className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <li key={order.id} className="p-4 sm:p-6">
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div>
                                            <p className="font-semibold text-lg text-gray-900">{order.customerName}</p>
                                            <p className="text-sm text-gray-500">{order.customerEmail}</p>
                                            <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-gray-800">${Number(order.total).toFixed(2)}</p>
                                            
                                            {/* --- ¡NUEVO SELECTOR DE ESTADO! --- */}
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                className={`mt-1 text-xs font-semibold rounded-full border-none appearance-none cursor-pointer p-1 pr-4 ${getStatusColor(order.status)}`}
                                            >
                                                <option value="PENDING">PENDIENTE</option>
                                                <option value="CONFIRMED">CONFIRMADO</option>
                                                <option value="DELIVERED">ENTREGADO</option>
                                                <option value="CANCELLED">CANCELADO</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="font-medium text-gray-700">Productos:</h4>
                                        <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                                            {order.items.map((item) => (
                                                <li key={item.id}>
                                                    {item.quantity} x {item.product.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
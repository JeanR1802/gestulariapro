// src/app/dashboard/ventas/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Definimos los tipos de datos que esperamos de la API
interface AnalyticsData {
    totalRevenue: number;
    salesCount: number;
    averageOrderValue: number;
    chartData: { name: string; total: number }[];
    topProducts: { name:string; count: number }[];
}

export default function VentasPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch('/api/analytics');
                if (!response.ok) throw new Error('No se pudieron cargar las analíticas.');
                const analyticsData = await response.json();
                setData(analyticsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading) return <div className="p-8 text-center">Cargando analíticas...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!data) return <div className="p-8 text-center">No hay datos disponibles.</div>;
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-800 mb-4">
                        &larr; Volver al Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Analíticas de Ventas</h1>
                    <p className="text-gray-600 mt-1">El rendimiento de tu negocio de un solo vistazo.</p>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Métricas Clave */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Ingresos Totales</h3>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">${data.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Número de Ventas</h3>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">{data.salesCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Ticket Promedio</h3>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">${data.averageOrderValue.toFixed(2)}</p>
                    </div>
                </div>

                {/* Gráfico y Top Productos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gráfico de Ventas */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Ventas por Día</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${value}`} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} />
                                <Legend wrapperStyle={{ fontSize: '14px' }} />
                                <Bar dataKey="total" fill="#3B82F6" name="Ingresos" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Productos */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Productos Más Vendidos</h3>
                        {data.topProducts.length > 0 ? (
                            <ul className="space-y-4">
                                {data.topProducts.map((product, index) => (
                                    <li key={index} className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">{product.name}</span>
                                        <span className="text-sm font-semibold text-gray-900">{product.count} vendidos</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                           <p className="text-sm text-gray-500">No hay suficientes datos de ventas.</p> 
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
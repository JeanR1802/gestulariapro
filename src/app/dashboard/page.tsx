'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// --- CORRECCIÓN AQUÍ: Definimos tipos específicos ---
interface Product {
  id: string; // Solo necesitamos el id para el conteo por ahora
}

interface Order {
  total: number;
}

interface Store {
  id: string
  name: string
  slug: string
  description: string | null
  primaryColor: string
  products: Product[] // Usamos el tipo Product[] en lugar de any[]
  orders: Order[]   // Usamos el tipo Order[] en lugar de any[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [store, setStore] = useState<Store | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch('/api/stores')
        const data = await response.json()
        setStore(data.store)
      } catch (error) {
        console.error('Error al cargar tienda:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchStore()
    }
  }, [session])
  
  const totalSales = store?.orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Hola, {session.user?.name}! 👋
            </h1>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="text-gray-600 hover:text-gray-900"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Panel de Control</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col">
              <h3 className="font-semibold text-blue-900 mb-2">🏪 Tu Tienda</h3>
              {store ? (
                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <p className="text-blue-700 font-medium mb-2">{store.name}</p>
                    <p className="text-blue-600 text-sm mb-4 break-words">
                      gestularia.com/tienda/{store.slug}
                    </p>
                  </div>
                  <div className="space-y-2 mt-auto">
                    <button
                      onClick={() => window.open(`/tienda/${store.slug}`, '_blank')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700"
                    >
                      Ver mi Tienda 👁️
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/productos')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
                    >
                      Gestionar Productos
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-blue-700 text-sm mb-4">Aún no has configurado tu tienda</p>
                  <button 
                    onClick={() => router.push('/dashboard/crear-tienda')}
                    className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
                  >
                    Crear mi Tienda
                  </button>
                </div>
              )}
            </div>

            <Link href="/dashboard/ventas" className="block bg-green-50 border border-green-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-green-900 mb-2">💰 Ventas</h3>
              <p className="text-2xl font-bold text-green-800">${totalSales.toFixed(2)}</p>
              <p className="text-green-700 text-sm">Total histórico</p>
            </Link>

            <Link href="/dashboard/pedidos" className="block bg-purple-50 border border-purple-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-purple-900 mb-2">📦 Pedidos</h3>
              <p className="text-2xl font-bold text-purple-800">
                {store?.orders?.length || 0}
              </p>
              <p className="text-purple-700 text-sm">Total recibidos</p>
            </Link>
            
            <Link href="/dashboard/contenido" className="block bg-yellow-50 border border-yellow-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-yellow-900 mb-2">✍️ Generador de Contenido</h3>
              <p className="text-yellow-800 text-2xl font-bold">Ideas</p>
              <p className="text-yellow-700 text-sm">Supera el bloqueo creativo</p>
            </Link>

          </div>

          {/* Resumen rápido si tiene tienda */}
          {store && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de tu tienda</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Información básica</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Nombre:</strong> {store.name}</p>
                    <p><strong>URL:</strong> /tienda/{store.slug}</p>
                    <p><strong>Productos:</strong> {store.products?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Próximos pasos</h4>
                  <div className="space-y-2 text-sm">
                    {(!store.products || store.products.length === 0) && (
                      <p className="text-orange-600">🛍️ Agrega tus primeros productos</p>
                    )}
                    <p className="text-blue-600">📲 Comparte el link de tu tienda</p>
                    <p className="text-purple-600">📊 Revisa tus pedidos y métricas</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
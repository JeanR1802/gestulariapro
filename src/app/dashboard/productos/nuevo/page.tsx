// src/app/dashboard/productos/nuevo/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CrearProductoPage() { // Renombramos la función para mayor claridad
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price) // Convertir precio a número
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el producto')
      }

      // Redirigimos a la lista de productos
      router.push('/dashboard/productos?message=Producto creado exitosamente')
      router.refresh() // Forzamos la actualización de los datos en la página anterior
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            &larr; Volver a Productos
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Agregar Nuevo Producto</h1>
          <p className="text-gray-600 mt-2">Completa los datos para añadir un producto a tu tienda.</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {/* ... (el resto del formulario es igual) ... */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nombre del producto *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Taza artesanal"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Descripción (opcional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe tu producto..."
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Precio *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 15.00"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">URL de la imagen (opcional)</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.price}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Guardando producto...' : 'Guardar Producto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
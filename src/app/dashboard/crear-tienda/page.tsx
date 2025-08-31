'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function CrearTiendaPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    primaryColor: '#3B82F6'
  })

  // Generar slug automáticamente
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Espacios por guiones
      .replace(/-+/g, '-') // Múltiples guiones por uno
      .trim()
    
    setFormData({ ...formData, name, slug })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la tienda')
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Crear tu Tienda Digital</h1>
          <p className="text-gray-600 mt-2">En menos de 5 minutos tendrás tu tienda lista para vender</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del negocio */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Nombre de tu negocio *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Mi Tienda Artesanal"
              />
            </div>

            {/* URL de la tienda */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                URL de tu tienda
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                  gestularia.com/tienda/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mi-tienda"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Esta será la dirección de tu tienda</p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Cuéntales a tus clientes de qué se trata tu negocio..."
              />
            </div>

            {/* Color principal */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Color principal de tu marca
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  className="w-12 h-12 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Vista previa */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Vista previa de tu tienda:</h3>
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2" style={{ color: formData.primaryColor }}>
                    {formData.name || 'Nombre de tu Negocio'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {formData.description || 'Descripción de tu negocio aquí'}
                  </p>
                  <div className="bg-white rounded p-3 mb-4">
                    <span className="text-gray-700">Tus productos aparecerán aquí</span>
                  </div>
                  <button 
                    type="button"
                    className="px-6 py-2 rounded font-semibold text-white"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Hacer Pedido
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.slug}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creando tu tienda...' : '🚀 Crear mi Tienda Digital'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
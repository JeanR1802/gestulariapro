// src/app/dashboard/productos/editar/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    isActive: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${id}`)
          if (!response.ok) {
            throw new Error('Producto no encontrado')
          }
          const data = await response.json()
          const { product } = data
          setFormData({
            name: product.name,
            description: product.description || '',
            price: String(product.price),
            image: product.image || '',
            isActive: product.isActive,
          })
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error cargando datos')
        } finally {
          setIsLoading(false)
        }
      }
      fetchProduct()
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el producto')
      }

      router.push('/dashboard/productos?message=Producto actualizado')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <p className="p-8 text-center">Cargando datos del producto...</p>
  if (error) return <p className="p-8 text-center text-red-600">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 mb-4">
            &larr; Volver a Productos
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
          <p className="text-gray-600 mt-2">Modifica los datos de tu producto.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... El formulario es casi idéntico al de crear ... */}
            {/* Nombre, Descripción, Precio, Imagen URL ... */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nombre del producto *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Descripción</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border rounded-lg" rows={3}/>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Precio *</label>
              <input type="number" required step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">URL de la imagen</label>
              <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-4 py-3 border rounded-lg"/>
            </div>
            {/* Campo para el estado Activo/Inactivo */}
            <div className="flex items-center">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Producto activo (visible en la tienda)</label>
            </div>
            
            <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? 'Guardando cambios...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
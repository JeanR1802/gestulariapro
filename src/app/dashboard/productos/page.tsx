'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Definimos el tipo para un producto para usarlo en el estado
type Product = {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
};

export default function ProductListPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Función para obtener los productos desde la API
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Error al cargar los productos')
      }
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error(error)
      // Aquí podrías establecer un estado de error para mostrarlo en la UI
    } finally {
      setIsLoading(false)
    }
  }

  // Usamos useEffect para llamar a la función de obtención de datos cuando el componente se monta
  useEffect(() => {
    fetchProducts()
  }, [])

  // Función para manejar la eliminación de un producto
  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo eliminar el producto');
      }

      alert('Producto eliminado exitosamente');
      // Volvemos a cargar la lista de productos para que se refleje el cambio
      fetchProducts(); 

    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Ocurrió un error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
                <p className="text-gray-600 mt-1">Aquí puedes ver y administrar todos los productos de tu tienda.</p>
            </div>
            <Link
              href="/dashboard/productos/nuevo"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              + Agregar Producto
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {isLoading ? (
            <p className="p-6 text-center text-gray-500">Cargando productos...</p>
          ) : products.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
                <p>Aún no has agregado ningún producto.</p>
                <p className="mt-1">¡Crea el primero haciendo clic en el botón de arriba!</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">${Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/dashboard/productos/editar/${product.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
// src/app/tienda/[slug]/TiendaClient.tsx
'use client'

import { useState } from 'react'
// --- CORRECCIÓN: Importamos los tipos desde nuestro archivo central ---
import { Store } from '../../../types'

interface Props {
  store: Store;
}

// Ya no necesitamos definir las interfaces 'Product' y 'Store' aquí

export default function TiendaClient({ store }: Props) {
  // El resto del código del componente se mantiene exactamente igual...
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const addToCart = (productId: string) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = store.products.find(p => p.id === productId);
      return total + (product ? Number(product.price) * quantity : 0);
    }, 0);
  };

  const getCartItemsCount = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };
  
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const orderItems = Object.entries(cart).map(([productId, quantity]) => ({
        productId,
        quantity,
    }));

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...orderData,
                items: orderItems,
                storeId: store.id,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ocurrió un error al enviar el pedido.');
        }

        setSubmitSuccess(true);
        setCart({});
    } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const closeModal = () => {
    setShowOrderForm(false);
    setSubmitSuccess(false);
    setSubmitError(null);
    setOrderData({ customerName: '', customerEmail: '', customerPhone: '', notes: '' });
  }

  // El resto del JSX se mantiene igual
  return (
    <div className="min-h-screen" style={{ backgroundColor: store.backgroundColor }}>
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ color: store.primaryColor }}>
              {store.name}
            </h1>
            {store.description && (
              <p className="text-gray-600 text-lg">{store.description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {getCartItemsCount() > 0 && !showOrderForm && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border-l-4" style={{ borderColor: store.primaryColor }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Carrito ({getCartItemsCount()})</span>
              <span className="text-lg font-bold" style={{ color: store.primaryColor }}>
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
            <button
                onClick={() => setShowOrderForm(true)}
                className="w-full text-white py-2 px-4 rounded font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: store.primaryColor }}
            >
                Hacer Pedido
            </button>
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros Productos</h2>
          {store.products.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Esta tienda aún no tiene productos disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {store.products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow flex flex-col">
                  {product.image && <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    {product.description && <p className="text-gray-600 text-sm mb-3 flex-grow">{product.description}</p>}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold" style={{ color: store.primaryColor }}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {cart[product.id] ? (
                        <div className="flex items-center space-x-2">
                            <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">-</button>
                            <span className="font-semibold">{cart[product.id]}</span>
                            <button onClick={() => addToCart(product.id)} className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:opacity-90" style={{ backgroundColor: store.primaryColor }}>+</button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(product.id)} className="text-white px-4 py-2 rounded font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: store.primaryColor }}>
                            Agregar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold">Completar Pedido</h3>
                        <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">&times;</button>
                    </div>
                    {submitSuccess ? (
                        <div className="text-center py-8">
                            <h4 className="text-2xl font-bold text-green-600 mb-2">¡Pedido enviado!</h4>
                            <p className="text-gray-700">Gracias por tu compra. Pronto recibirás noticias nuestras.</p>
                            <button onClick={closeModal} className="mt-6 w-full text-white py-2 px-4 rounded font-semibold" style={{ backgroundColor: store.primaryColor }}>
                                Cerrar
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold mb-3">Tu pedido:</h4>
                                {Object.entries(cart).map(([productId, quantity]) => {
                                    const product = store.products.find(p => p.id === productId);
                                    if (!product) return null;
                                    return (
                                        <div key={productId} className="flex justify-between text-sm mb-1">
                                            <span>{product.name} x {quantity}</span>
                                            <span>${(Number(product.price) * quantity).toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                                <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                                    <span>Total:</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                            </div>
                            <form onSubmit={handleSubmitOrder} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Nombre completo *</label>
                                    <input type="text" required value={orderData.customerName} onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Email *</label>
                                    <input type="email" required value={orderData.customerEmail} onChange={(e) => setOrderData({ ...orderData, customerEmail: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Teléfono (opcional)</label>
                                    <input type="tel" value={orderData.customerPhone} onChange={(e) => setOrderData({ ...orderData, customerPhone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Notas adicionales</label>
                                    <textarea value={orderData.notes} onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2}/>
                                </div>
                                {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                                <button type="submit" disabled={isSubmitting} className="w-full text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50" style={{ backgroundColor: store.primaryColor }}>
                                    {isSubmitting ? 'Enviando pedido...' : `Confirmar Pedido por $${getCartTotal().toFixed(2)}`}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
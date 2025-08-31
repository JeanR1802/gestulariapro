import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Gestularia</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Crea tu tienda digital profesional
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Convierte tu emprendimiento en un negocio serio. Tu propia tienda digital 
            con subdominio personalizado: <strong>tu-negocio.gestularia.com</strong>
          </p>
          
          <div className="space-x-4 mb-12">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              🚀 Crear mi Tienda Gratis
            </Link>
            <Link 
              href="/login" 
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Ejemplo visual */}
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 mb-6 text-lg">👆 Mira cómo se ve tu tienda:</p>
            
            {/* Simulación de browser */}
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
              {/* Barra del navegador */}
              <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-700">
                  🌐 <strong>mi-panaderia.gestularia.com</strong>
                </div>
              </div>
              
              {/* Contenido de la tienda de ejemplo */}
              <div className="p-8">
                <h2 className="text-3xl font-bold text-blue-600 mb-4">Mi Panadería Artesanal</h2>
                <p className="text-gray-600 mb-6">Los mejores panes horneados cada mañana</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Pan Integral - $15</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium">
                      Agregar al Carrito
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Croissants - $8</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium">
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">¿Por qué Gestularia?</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="text-4xl mb-4">🏪</div>
                <h4 className="font-bold mb-2">Tu Propia Tienda</h4>
                <p className="text-gray-600">Subdominio personalizado que parece tu propio sitio web</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="text-4xl mb-4">📱</div>
                <h4 className="font-bold mb-2">Fácil de Compartir</h4>
                <p className="text-gray-600">Un link limpio y profesional para todas tus redes</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="text-4xl mb-4">💰</div>
                <h4 className="font-bold mb-2">Vende Más</h4>
                <p className="text-gray-600">Sistema profesional que genera confianza en tus clientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { notFound } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import TiendaClient from './TiendaClient'
import { Store } from '../../../types'

interface Props {
  params: {
    slug: string
  }
}

async function getTienda(slug: string) {
  try {
    const storeFromDb = await prisma.store.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!storeFromDb) return null;

    // Convertimos los precios de Decimal a number para el componente cliente
    const sanitizedProducts = storeFromDb.products.map(product => ({
      ...product,
      price: Number(product.price),
    }));
    
    return {
        ...storeFromDb,
        products: sanitizedProducts,
    };

  } catch (error) {
    console.error('Error al cargar tienda:', error)
    return null
  }
}

// --- LÍNEA CLAVE ---
// Asegúrate de que esta línea contenga "export default"
export default async function TiendaPage({ params }: Props) {
  const store = await getTienda(params.slug)

  if (!store || !store.isActive) {
    notFound()
  }

  // Asegúrate de que estás devolviendo el componente cliente aquí
  return <TiendaClient store={store as Store} />
}

// Esta es una exportación nombrada y está bien que coexista
export async function generateMetadata({ params }: Props) {
    const store = await getTienda(params.slug)
    if (!store) {
        return {
            title: 'Tienda no encontrada - Gestularia',
        }
    }
    return {
        title: `${store.name} - Tienda Digital`,
        description: store.description || `Conoce los productos de ${store.name}`,
    }
}
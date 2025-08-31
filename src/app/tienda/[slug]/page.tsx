import { notFound } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import TiendaClient from './TiendaClient'
import { Store } from '../../../types'

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

// Aquí definimos el tipo de los parámetros directamente en la función
export default async function TiendaPage({ params }: { params: { slug: string } }) {
  const store = await getTienda(params.slug)

  if (!store || !store.isActive) {
    notFound()
  }

  return <TiendaClient store={store as Store} />
}

// Hacemos lo mismo en la función de metadata
export async function generateMetadata({ params }: { params: { slug: string } }) {
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
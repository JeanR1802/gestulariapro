// FILE: src/app/tienda/[slug]/page.tsx
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

    if (!storeFromDb) return null

    const sanitizedProducts = storeFromDb.products.map(product => ({
      ...product,
      price: Number(product.price),
    }))
    
    return {
      ...storeFromDb,
      products: sanitizedProducts,
    }
  } catch (error) {
    console.error('Error al cargar tienda:', error)
    return null
  }
}

// ✅ Definimos un tipo reutilizable
interface PageProps {
  params: {
    slug: string
  }
}

export default async function TiendaPage({ params }: PageProps) {
  const store = await getTienda(params.slug)

  if (!store || !store.isActive) {
    notFound()
  }

  return <TiendaClient store={store as Store} />
}

export async function generateMetadata({ params }: PageProps) {
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

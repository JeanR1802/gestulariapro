import { notFound } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import TiendaClient from './TiendaClient'

interface Props {
  params: {
    slug: string
  }
}

async function getTienda(slug: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    return store
  } catch (error) {
    console.error('Error al cargar tienda:', error)
    return null
  }
}

export default async function TiendaPage({ params }: Props) {
  const store = await getTienda(params.slug)

  if (!store || !store.isActive) {
    notFound()
  }

  return <TiendaClient store={store} />
}

// Generar metadata dinámicamente
export async function generateMetadata({ params }: Props) {
  const store = await getTienda(params.slug)
  
  if (!store) {
    return {
      title: 'Tienda no encontrada - Gestularia'
    }
  }

  return {
    title: `${store.name} - Tienda Digital`,
    description: store.description || `Conoce los productos de ${store.name}`,
  }
}
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './../../../lib/auth'
import { prisma } from './../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { name, slug, description, primaryColor } = await request.json()

    // Validaciones
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nombre y URL son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el slug no esté en uso
    const existingStore = await prisma.store.findUnique({
      where: { slug }
    })

    if (existingStore) {
      return NextResponse.json(
        { error: 'Esta URL ya está en uso, prueba con otra' },
        { status: 400 }
      )
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no tenga ya una tienda
    if (user.store) {
      return NextResponse.json(
        { error: 'Ya tienes una tienda creada' },
        { status: 400 }
      )
    }

    // Crear la tienda
    const store = await prisma.store.create({
      data: {
        name,
        slug,
        description: description || null,
        primaryColor,
        userId: user.id
      }
    })

    return NextResponse.json({
      message: 'Tienda creada exitosamente',
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        primaryColor: store.primaryColor
      }
    })

  } catch (error) {
    console.error('Error al crear tienda:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Buscar la tienda del usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        store: {
          include: {
            products: true,
            orders: true
          }
        }
      }
    })

    if (!user?.store) {
      return NextResponse.json({ store: null })
    }

    return NextResponse.json({ store: user.store })

  } catch (error) {
    console.error('Error al obtener tienda:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
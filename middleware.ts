import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host')
  
  if (!hostname) {
    return NextResponse.next()
  }

  // Extraer el subdominio
  const subdomain = hostname.split('.')[0]
  
  // Si es www o el dominio principal, ir al dashboard/landing
  if (subdomain === 'www' || hostname === 'gestularia.com' || hostname === 'localhost:3000') {
    return NextResponse.next()
  }
  
  // Si es un subdominio, reescribir a la ruta de tienda
  if (subdomain && subdomain !== 'www') {
    url.pathname = `/tienda/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
}
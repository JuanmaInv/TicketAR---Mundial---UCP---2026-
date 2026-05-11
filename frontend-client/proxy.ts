import { NextResponse } from 'next/server';

export default function proxy() {
  // Pass-through temporal para aislar 404 de plataforma en Vercel.
  // Una vez confirmado, reactivamos Clerk sobre rutas protegidas.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/profile/:path*',
    '/stats/:path*',
  ],
};

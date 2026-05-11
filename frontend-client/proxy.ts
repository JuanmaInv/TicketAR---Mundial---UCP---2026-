import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const esRutaProtegida = createRouteMatcher([
  '/checkout(.*)',
  '/profile(.*)',
  '/stats(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (esRutaProtegida(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/checkout/:path*',
    '/profile/:path*',
    '/stats/:path*',
  ],
};

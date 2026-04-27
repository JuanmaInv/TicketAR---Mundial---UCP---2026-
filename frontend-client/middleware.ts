import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protegemos SOLO checkout y profile. 
// Login y Registro DEBEN ser públicos para evitar bucles.
const isProtectedRoute = createRouteMatcher([
  '/checkout(.*)',
  '/profile(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Ignorar archivos estáticos y rutas internas de next
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecutar para APIs
    '/(api|trpc)(.*)',
  ],
};

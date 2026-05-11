import { redirect } from 'next/navigation';

export default async function CheckoutByIdPage() {
  // En esta rama de testing solo necesitamos que la ruta exista para type-check.
  // El flujo real de checkout se valida en ramas de integración funcional.
  redirect('/checkout');
}


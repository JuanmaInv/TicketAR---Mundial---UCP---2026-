import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function CheckoutRootPage() {
  const sesion = await auth();

  if (!sesion.userId) {
    redirect('/login');
  }

  redirect('/matches');
}

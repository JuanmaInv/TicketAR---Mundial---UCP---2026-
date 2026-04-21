'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import BuyerForm from '@/components/checkout/BuyerForm';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: partidoId } = use(params);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver
        </button>
      </div>

      <div className="glass rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6">
          Ingreso de datos del comprador (Paso 2)
        </h1>
        <p className="text-zinc-400 mb-6 border-b border-white/10 pb-4">
          Estás reservando el ticket ID: <strong className="text-white">{partidoId}</strong>.
        </p>

        {/* Usamos el nuevo componente*/}
        <BuyerForm partidoId={partidoId} />
      </div>
    </div>
  );
}

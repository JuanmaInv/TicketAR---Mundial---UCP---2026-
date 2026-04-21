'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import BuyerForm from '@/components/checkout/BuyerForm';
import ResumenCompra from '@/components/checkout/ResumenCompra';
import { DatosCompra } from '@/types/ticket';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: partidoId } = use(params);

  // Estado para controlar en qué paso del checkout estamos
  const [paso, setPaso] = useState(2);
  const [datosComprador, setDatosComprador] = useState<DatosCompra | null>(null);

  const avanzarAlResumen = (datos: DatosCompra) => {
    setDatosComprador(datos);
    setPaso(3);
  };

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
          {paso === 2 ? 'Ingreso de datos del comprador (Paso 2)' : 'Resumen (Paso 3)'}
        </h1>
        <p className="text-zinc-400 mb-6 border-b border-white/10 pb-4">
          Estás reservando el ticket ID: <strong className="text-white">{partidoId}</strong>.
        </p>

        {/* Lógica de pasos: Si es paso 2, mostramos formulario. Si es 3, mostramos resumen. */}
        {paso === 2 && (
          <BuyerForm
            partidoId={partidoId}
            onValidacionExitosa={avanzarAlResumen}  //para corregir el error hay que ver la linea 252 en BuyerForm.tsx
          />
        )}

        {paso === 3 && datosComprador && (
          <ResumenCompra
            partidoId={partidoId}
            datos={datosComprador}
            onVolver={() => setPaso(2)}
            onConfirmar={() => alert('Pronto conectaremos esto al backend')}
          />
        )}
      </div>
    </div>
  );
}

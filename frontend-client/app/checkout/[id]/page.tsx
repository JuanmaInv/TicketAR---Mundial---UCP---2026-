'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import BuyerForm from '@/components/checkout/BuyerForm';
import ResumenCompra from '@/components/checkout/ResumenCompra';
import CountdownTimer from '@/components/CountdownTimer';
import { DatosCompra } from '@/types/ticket';
import { createTicket } from '@/lib/api';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: partidoId } = use(params);

  // Estado para controlar en qué paso del checkout estamos
  const [paso, setPaso] = useState(2);
  const [datosComprador, setDatosComprador] = useState<DatosCompra | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Timer mockeado con 15 minutos a futuro
  const [fechaExpiracion] = useState(new Date(Date.now() + 15 * 60 * 1000));

  const manejarExpiracion = () => {
    alert("¡Ups! Se te acabaron los 15 minutos y se canceló la compra. Las entradas han sido liberadas.");
    router.push('/');
  };

  const avanzarAlResumen = (datos: DatosCompra) => {
    setDatosComprador(datos);
    setPaso(3);
  };

  const manejarConfirmacion = async () => {
    if (!datosComprador) return;
    setProcesando(true);
    try {
      await createTicket({
        partidoId: partidoId,
        nombre: datosComprador.nombre,
        apellido: datosComprador.apellido,
        email: datosComprador.email,
        documento: datosComprador.documento,
        telefono: datosComprador.telefono,
        localidad: datosComprador.localidad,
        provincia: datosComprador.provincia,
        cantidad: datosComprador.cantidad,
        sector: 'PLATEA', // Por ahora default hasta conectar selector de asientos
        precio: 50000,
        estado: 'vendido',
        fechaCompra: new Date().toISOString()
      });
      
      alert('¡Compra realizada con éxito! Recibirás tus tickets por correo.');
      router.push('/my-tickets');
    } catch (error: any) {
      alert('Error al procesar la compra: ' + error.message);
    } finally {
      setProcesando(false);
    }
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
        <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-6">
          <h1 className="text-3xl font-bold text-white">
            {paso === 2 ? 'Ingreso de datos (Paso 2)' : 'Resumen (Paso 3)'}
          </h1>
          <div className="flex-shrink-0">
            <CountdownTimer 
              tiempoExpiracion={fechaExpiracion} 
              onExpirar={manejarExpiracion} 
            />
          </div>
        </div>
        <p className="text-zinc-400 mb-6 border-b border-white/10 pb-4">
          Estás reservando para el partido ID: <strong className="text-white">{partidoId}</strong>.
        </p>

        {paso === 2 && (
          <BuyerForm
            partidoId={partidoId}
            onValidacionExitosa={avanzarAlResumen}
          />
        )}

        {paso === 3 && datosComprador && (
          <ResumenCompra
            partidoId={partidoId}
            datos={datosComprador}
            onVolver={() => setPaso(2)}
            onConfirmar={manejarConfirmacion}
          />
        )}
        
        {procesando && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="text-white font-black text-xl animate-pulse uppercase tracking-[0.5em]">
              Procesando Pago...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

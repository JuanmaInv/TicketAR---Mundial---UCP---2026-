'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SectorSelector from '@/components/checkout/SectorSelector';
import CountdownTimer from '@/components/CountdownTimer';
import { createTicket } from '@/lib/api';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useUser();
  const { id: partidoId } = use(params);

  const [procesando, setProcesando] = useState(false);
  const [fechaExpiracion, setFechaExpiracion] = useState<Date | null>(null);

  useEffect(() => {
    const storageKey = `checkout_timer_${partidoId}`;
    const guardado = localStorage.getItem(storageKey);
    
    if (guardado) {
      const fechaGuardada = new Date(guardado);
      if (fechaGuardada.getTime() <= Date.now()) {
        manejarExpiracion();
      } else {
        setFechaExpiracion(fechaGuardada);
      }
    } else {
      const nuevaFecha = new Date(Date.now() + 15 * 60 * 1000);
      localStorage.setItem(storageKey, nuevaFecha.toISOString());
      setFechaExpiracion(nuevaFecha);
    }
  }, [partidoId]);

  const manejarExpiracion = () => {
    localStorage.removeItem(`checkout_timer_${partidoId}`);
    alert("¡Ups! Se te acabaron los 15 minutos y se canceló la reserva. Las entradas han sido liberadas.");
    router.push('/');
  };

  const handleComprar = async (sector: string, cantidad: number, total: number) => {
    if (!user?.emailAddresses[0]?.emailAddress) {
      alert('Por favor inicia sesión para continuar');
      return;
    }

    setProcesando(true);
    try {
      await createTicket({
        partidoId: partidoId,
        nombre: user.firstName || 'Cliente',
        apellido: user.lastName || '',
        email: user.emailAddresses[0].emailAddress,
        documento: user.username || '',
        telefono: user.phoneNumbers[0]?.phoneNumber || '',
        localidad: '',
        provincia: '',
        cantidad: cantidad as 1 | 2 | 3 | 4 | 5 | 6,
        sector: sector,
        precio: Math.floor(total / cantidad),
        estado: 'vendido',
        fechaCompra: new Date().toISOString()
      });
      
      localStorage.removeItem(`checkout_timer_${partidoId}`);
      alert('¡Compra realizada con éxito! Recibirás tus tickets por correo.');
      router.push('/my-tickets');
    } catch (error: any) {
      alert('Error al procesar la compra: ' + error.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl min-h-screen flex flex-col">
      <div className="mb-8">
        <button 
          onClick={() => router.back()} 
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>

      <div className="glass rounded-3xl p-8 shadow-2xl flex-1">
        <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Selecciona tu Entrada</h1>
            <p className="text-zinc-400">Partido ID: <strong className="text-white">{partidoId}</strong></p>
          </div>
          <div className="flex-shrink-0">
            {fechaExpiracion && (
              <CountdownTimer 
                tiempoExpiracion={fechaExpiracion} 
                onExpirar={manejarExpiracion} 
              />
            )}
          </div>
        </div>

        <SectorSelector partidoId={partidoId} onComprar={handleComprar} />
        
        {procesando && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="text-white font-black text-xl animate-pulse uppercase tracking-[0.5em]">
              Procesando Compra...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

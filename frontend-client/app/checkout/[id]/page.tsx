'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SectorSelector from '@/components/checkout/SectorSelector';
import CountdownTimer from '@/components/CountdownTimer';
import { createTicket, getUsuario, pagarTicket } from '@/lib/api';

function CheckoutContent({ partidoId }: { partidoId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const stepFromUrl = parseInt(searchParams.get('step') || '1');
  const [paso, setPaso] = useState(stepFromUrl); // 1: Datos, 2: Sectores
  const [procesando, setProcesando] = useState(false);
  const [fechaExpiracion, setFechaExpiracion] = useState<Date | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);

  // Cargar datos del usuario para el Paso 1
  useEffect(() => {
    if (user?.emailAddresses[0]?.emailAddress) {
      getUsuario(user.emailAddresses[0].emailAddress)
        .then(data => {
          if (data && data.id) {
            setUserData(data);
          } else {
            router.push('/profile?error=not_registered');
          }
          setCargandoUsuario(false);
        })
        .catch(err => {
          console.error('Error:', err);
          setCargandoUsuario(false);
        });
    }
  }, [user, router]);

  useEffect(() => {
    const nuevaFecha = new Date(Date.now() + 15 * 60 * 1000);
    setFechaExpiracion(nuevaFecha);
  }, [partidoId]);

  const perfilIncompleto = !userData?.nombre || 
                           !userData?.apellido || 
                           !userData?.numeroPasaporte || 
                           !userData?.telefono || 
                           !userData?.provincia || 
                           !userData?.localidad;

  // Bloqueo de seguridad
  useEffect(() => {
    if (!cargandoUsuario && paso === 2 && perfilIncompleto) {
      router.push(`/profile?matchId=${partidoId}`);
    }
  }, [paso, perfilIncompleto, cargandoUsuario, router, partidoId]);

  const handleComprar = async (sectorId: string, cantidad: number, total: number) => {
    setProcesando(true);
    try {
      const ticketResponse = await createTicket({
        idUsuario: userData.id,
        idPartido: partidoId,
        idSector: sectorId
      });
      
      const paymentResponse = await pagarTicket(ticketResponse.id);
      
      if (paymentResponse.paymentResult?.paymentUrl) {
        window.location.href = paymentResponse.paymentResult.paymentUrl;
      } else {
        router.push('/my-tickets');
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
      setProcesando(false);
    }
  };

  if (cargandoUsuario) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-foreground font-black uppercase tracking-[0.4em] italic animate-pulse">Verificando Identidad...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen py-12 px-4 bg-background transition-colors duration-500 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl">
        
        {/* HEADER: INDICADOR DE PASOS Y TIMER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4 bg-card px-8 py-4 rounded-[2rem] border border-border shadow-sm">
             <div className="flex items-center gap-3">
                <span className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-sm ${paso >= 1 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>1</span>
                <span className={`text-xs font-black uppercase tracking-widest ${paso === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Datos</span>
             </div>
             <div className="w-12 h-[2px] bg-border"></div>
             <div className="flex items-center gap-3">
                <span className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-sm ${paso >= 2 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>2</span>
                <span className={`text-xs font-black uppercase tracking-widest ${paso === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Ubicación</span>
             </div>
             <div className="w-12 h-[2px] bg-border"></div>
             <div className="flex items-center gap-3">
                <span className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-sm ${paso >= 3 ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>3</span>
                <span className={`text-xs font-black uppercase tracking-widest ${paso === 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Pago</span>
             </div>
          </div>

          {fechaExpiracion && (
            <div className="bg-black text-white p-2 rounded-2xl border-4 border-red-500/20 shadow-2xl">
              <div className="px-6 py-4 rounded-xl flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-red-400">Tiempo restante para abonar:</p>
                <CountdownTimer tiempoExpiracion={fechaExpiracion} onExpirar={() => router.push('/')} />
              </div>
            </div>
          )}
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-card border-2 border-border rounded-[4rem] shadow-2xl relative overflow-hidden transition-all duration-500">
          
          <div className="p-12 md:p-20">
            {/* PASO 1: CONFIRMACIÓN DE DATOS */}
            {paso === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <button 
                  onClick={() => router.back()} 
                  className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-[0.4em] mb-16 flex items-center gap-3 transition-colors group"
                >
                  <span className="group-hover:-translate-x-3 transition-transform text-xl">←</span> VOLVER A SELECCIÓN DE PARTIDO
                </button>
                
                <h1 className="text-7xl md:text-9xl font-black text-foreground mb-4 uppercase italic tracking-tighter leading-none">
                  PASO 1: <span className="text-blue-600">TUS DATOS</span>
                </h1>
                <div className="flex items-center gap-4 mb-16">
                  <div className="w-1.5 h-10 bg-blue-600"></div>
                  <p className="text-muted-foreground text-sm md:text-base font-bold uppercase tracking-widest italic">
                    Verifica tu identidad antes de continuar
                  </p>
                </div>

                <div className="bg-background border-2 border-border rounded-[3rem] p-12 mb-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Nombre Completo</label>
                      <p className="text-2xl font-black text-foreground italic uppercase">
                        {userData?.nombre || '---'} {userData?.apellido || '---'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Documento (DNI/Pasaporte)</label>
                      <p className={`text-2xl font-black italic uppercase ${userData?.numeroPasaporte ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                        {userData?.numeroPasaporte || '❌ No cargado'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Email de Contacto</label>
                      <p className="text-2xl font-black text-foreground italic uppercase">{userData?.email || user?.emailAddresses[0]?.emailAddress}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Teléfono</label>
                      <p className={`text-2xl font-black italic uppercase ${userData?.telefono ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                        {userData?.telefono || '❌ No cargado'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Provincia</label>
                      <p className={`text-2xl font-black italic uppercase ${userData?.provincia ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                        {userData?.provincia || '❌ No cargado'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Localidad</label>
                      <p className={`text-2xl font-black italic uppercase ${userData?.localidad ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                        {userData?.localidad || '❌ No cargado'}
                      </p>
                    </div>
                  </div>
                </div>

                {perfilIncompleto ? (
                  <div className="flex flex-col gap-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl flex items-center gap-4 mb-4">
                      <span className="text-3xl">⚠️</span>
                      <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                        Tu perfil está incompleto. El Mundial exige validación de identidad oficial.
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push(`/profile?redirect=/checkout/${partidoId}`)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-blue-500/20 text-lg"
                    >
                      Completar mi Perfil Ahora →
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setPaso(2)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-emerald-500/20 text-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Confirmar Datos y Continuar →
                  </button>
                )}
              </div>
            )}

            {/* PASO 2: SELECCIÓN DE SECTOR */}
            {paso === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <button 
                  onClick={() => setPaso(1)} 
                  className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2 transition-colors group"
                >
                  <span className="group-hover:-translate-x-2 transition-transform">←</span> Volver a Confirmación de Datos
                </button>

                <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4 uppercase italic tracking-tighter leading-none">
                  PASO 2: <span className="text-blue-600">UBICACIÓN</span>
                </h1>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-12 italic border-l-4 border-blue-600 pl-4">
                  Elige tu lugar en el estadio
                </p>

                <SectorSelector partidoId={partidoId} onComprar={handleComprar} />
              </div>
            )}
          </div>

          {procesando && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-10 shadow-[0_0_50px_rgba(37,99,235,0.3)]"></div>
              <p className="text-foreground font-black uppercase tracking-[0.5em] italic text-xl animate-pulse">Redirigiendo a Pago Real...</p>
              <p className="text-muted-foreground text-xs mt-4 font-bold uppercase tracking-widest">Asegura tu conexión • Procesamiento Seguro</p>
            </div>
          )}
        </div>

        {/* GARANTÍA */}
        <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex items-center gap-3">
             <span className="text-2xl">🛡️</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Compra 100% Segura</span>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-2xl">⚡</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Procesamiento Instantáneo</span>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-2xl">🌍</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Soporte FIFA Oficial</span>
           </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: partidoId } = use(params);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-foreground font-black uppercase tracking-[0.4em] italic animate-pulse">Cargando Checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent partidoId={partidoId} />
    </Suspense>
  );
}

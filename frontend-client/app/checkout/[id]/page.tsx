'use client';

import { use, useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SectorSelector from '@/components/checkout/SectorSelector';
import CountdownTimer from '@/components/CountdownTimer';
import { createTicket, getUsuario, pagarTicket, getPartidos } from '@/lib/api';
import { Partido } from '@/types/ticket';
import Bandera from '@/components/Bandera';

function CheckoutContent({ partidoId }: { partidoId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const stepFromUrl = parseInt(searchParams.get('step') || '1');
  const [paso, setPaso] = useState(stepFromUrl); // 1: Datos, 2: Sectores
  const [procesando, setProcesando] = useState(false);
  const [fechaExpiracion, setFechaExpiracion] = useState<Date | null>(null);
  const [datosUsuario, setDatosUsuario] = useState<{ id: string; nombre: string; apellido: string; numeroPasaporte: string; telefono: string; email: string; provincia: string; localidad: string } | null>(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [partidoInfo, setPartidoInfo] = useState<Partido | null>(null);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);

  const limpiarCheckout = useCallback(() => {
    localStorage.removeItem(`checkout_step_${partidoId}`);
    localStorage.removeItem(`checkout_expiration_${partidoId}`);
    localStorage.removeItem(`checkout_selection_${partidoId}`);
  }, [partidoId]);

  // Cargar datos del usuario para el Paso 1
  useEffect(() => {
    if (user?.emailAddresses[0]?.emailAddress) {
      getUsuario(user.emailAddresses[0].emailAddress)
        .then(data => {
          if (data && data.id) {
            setDatosUsuario(data);
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

  // Cargar info del partido
  useEffect(() => {
    getPartidos().then(partidos => {
      const p = partidos.find(p => p.id === partidoId);
      if (p) setPartidoInfo(p);
    }).catch(console.error);
  }, [partidoId]);

  // Cargar estado persistente (Paso y Timer)
  useEffect(() => {
    const savedStep = localStorage.getItem(`checkout_step_${partidoId}`);
    if (savedStep) setPaso(parseInt(savedStep));

    const savedExpiration = localStorage.getItem(`checkout_expiration_${partidoId}`);
    if (savedExpiration) {
      const savedDate = new Date(parseInt(savedExpiration));
      if (savedDate.getTime() > Date.now()) {
        setFechaExpiracion(savedDate);
      } else {
        // Expirado — limpiar y empezar de nuevo
        limpiarCheckout();
        const nuevaFecha = new Date(Date.now() + 15 * 60 * 1000);
        setFechaExpiracion(nuevaFecha);
        localStorage.setItem(`checkout_expiration_${partidoId}`, nuevaFecha.getTime().toString());
        setPaso(1);
      }
    } else {
      const nuevaFecha = new Date(Date.now() + 15 * 60 * 1000);
      setFechaExpiracion(nuevaFecha);
      localStorage.setItem(`checkout_expiration_${partidoId}`, nuevaFecha.getTime().toString());
    }
  }, [partidoId]);

  // Persistir paso cuando cambia
  useEffect(() => {
    localStorage.setItem(`checkout_step_${partidoId}`, paso.toString());
  }, [paso, partidoId]);

  const perfilIncompleto = !datosUsuario || 
                           !datosUsuario.nombre || 
                           !datosUsuario.apellido || 
                           !datosUsuario.numeroPasaporte || 
                           !datosUsuario.telefono || 
                           !datosUsuario.provincia || 
                           !datosUsuario.localidad;

  // Bloqueo de seguridad
  useEffect(() => {
    if (!cargandoUsuario && perfilIncompleto && paso >= 1) {
      router.push(`/profile?partidoId=${partidoId}`);
    }
  }, [paso, perfilIncompleto, cargandoUsuario, router, partidoId]);

  async function handleComprar(sectorId: string) {
    if (!datosUsuario) return;
    setProcesando(true);
    try {
      const ticketResponse = await createTicket({
        idUsuario: datosUsuario.id,
        idPartido: partidoId,
        idSector: sectorId
      });
      
      const paymentResponse = await pagarTicket(ticketResponse.id);
      
      if (paymentResponse.paymentResult?.paymentUrl) {
        limpiarCheckout();
        window.location.href = paymentResponse.paymentResult.paymentUrl;
      } else {
        setPaso(4);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error en compra:", error);
      let mensajeAmigable = "Hubo un problema al procesar tu solicitud. Por favor intenta de nuevo.";
      
      const msg = error.message ? error.message.toLowerCase() : '';
      if (msg.includes("fondos") || msg.includes("rechazada")) {
        mensajeAmigable = "Tu tarjeta fue rechazada por falta de fondos o seguridad. Por favor, intenta con otro medio de pago.";
      } else if (msg.includes("stock") || msg.includes("agotado") || msg.includes("no quedan asientos")) {
        mensajeAmigable = "Lo sentimos, no quedan asientos disponibles en este sector. Volvé al paso anterior y elegí otro sector.";
      } else if (msg.includes("sector") && (msg.includes("no está disponible") || msg.includes("no esta disponible"))) {
        mensajeAmigable = "Este sector no está habilitado para el partido seleccionado. Puede que la configuración de sectores aún no esté completa en el sistema. Contacta a soporte o probá con otro partido.";
      } else if (msg.includes("máximo") || msg.includes("maximo") || msg.includes("entradas activas")) {
        mensajeAmigable = "Ya alcanzaste el límite de 6 entradas por cuenta para este partido.";
      } else if (msg.includes("pasaporte")) {
        mensajeAmigable = "Necesitás tener un pasaporte/DNI registrado en tu perfil para comprar entradas.";
      } else if (error.message) {
        // Mostrar el mensaje real del backend si no matchea ninguno anterior
        mensajeAmigable = error.message;
      }

      setErrorMensaje(mensajeAmigable);
    } finally {
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
          <div className="flex items-center gap-2 md:gap-4 bg-card px-4 md:px-8 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-sm overflow-x-auto no-scrollbar">
             <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <span className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full font-black text-xs md:text-sm ${paso >= 1 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>1</span>
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${paso === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Datos</span>
             </div>
             <div className="w-6 md:w-12 h-[2px] bg-border shrink-0"></div>
             <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <span className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full font-black text-xs md:text-sm ${paso >= 2 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>2</span>
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${paso === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Ubicación</span>
             </div>
             <div className="w-6 md:w-12 h-[2px] bg-border shrink-0"></div>
             <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <span className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full font-black text-xs md:text-sm ${paso >= 3 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>3</span>
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${paso === 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Resumen</span>
             </div>
             <div className="w-6 md:w-12 h-[2px] bg-border shrink-0"></div>
             <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <span className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full font-black text-xs md:text-sm ${paso >= 4 ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>4</span>
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${paso === 4 ? 'text-foreground' : 'text-muted-foreground'}`}>Pago</span>
             </div>
          </div>

          {fechaExpiracion && (
            <div className="bg-black text-white p-2 rounded-2xl border-4 border-red-500/20 shadow-2xl">
              <div className="px-6 py-4 rounded-xl flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-red-400">Tiempo restante para abonar:</p>
          <CountdownTimer
              tiempoExpiracion={fechaExpiracion}
              onExpirar={() => {
                limpiarCheckout();
                router.push('/matches');
              }}
            />
              </div>
            </div>
          )}
        </div>

        {/* ERROR FEEDBACK */}
        {errorMensaje && (
          <div className="mb-8 bg-red-500/10 border-2 border-red-500 p-6 rounded-3xl animate-in slide-in-from-top-4 duration-500 flex items-center justify-between gap-6 shadow-2xl shadow-red-500/20">
            <div className="flex items-center gap-4">
              <span className="text-4xl">⚠️</span>
              <div>
                <p className="text-red-600 dark:text-red-400 font-black uppercase text-[10px] tracking-widest mb-1">Error en la transacción</p>
                <p className="text-foreground font-bold">{errorMensaje}</p>
              </div>
            </div>
            <button 
              onClick={() => { setErrorMensaje(null); }}
              className="bg-red-500 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-colors"
            >
              ENTENDIDO
            </button>
          </div>
        )}

        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-card border-2 border-border rounded-[4rem] shadow-2xl relative overflow-hidden transition-all duration-500">
          
          <div className="p-12 md:p-20">
            {/* PASO 1: CONFIRMACIÓN DE DATOS */}
            {paso === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <button
                  onClick={() => router.back()}
                  className="group flex items-center gap-3 bg-card hover:bg-blue-600 border-2 border-border hover:border-blue-600 text-foreground hover:text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 mb-10 shadow-md"
                >
                  <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                  VOLVER A SELECCIÓN DE PARTIDO
                </button>
                
                <h1 className="text-5xl md:text-9xl font-black text-foreground mb-4 uppercase italic tracking-tighter leading-none">
                  PASO 1: <span className="text-blue-600">TUS DATOS</span>
                </h1>
                <div className="flex items-center gap-4 mb-10 md:mb-16">
                  <div className="w-1.5 h-10 bg-blue-600"></div>
                  <p className="text-muted-foreground text-xs md:text-base font-bold uppercase tracking-widest italic">
                    Verifica tu identidad antes de continuar
                  </p>
                </div>

                <div className="bg-background border-2 border-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 mb-10 md:mb-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-y-12 gap-x-16">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Nombre Completo</label>
                      <p className="text-lg md:text-2xl font-black text-foreground italic uppercase">
                        {datosUsuario?.nombre || '---'} {datosUsuario?.apellido || '---'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Documento (DNI/Pasaporte)</label>
                      <p className={`text-lg md:text-2xl font-black italic uppercase ${datosUsuario?.numeroPasaporte ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                        {datosUsuario?.numeroPasaporte || '❌ No cargado'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Email de Contacto</label>
                      <p className="text-lg md:text-2xl font-black text-foreground italic uppercase truncate">{datosUsuario?.email || user?.emailAddresses[0]?.emailAddress}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Teléfono</label>
                      <p className={`text-lg md:text-2xl font-black italic uppercase ${datosUsuario?.telefono ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                        {datosUsuario?.telefono || '❌ No cargado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-10 pt-10 border-t border-border flex justify-between items-center">
                    <button
                      onClick={() => router.push(`/profile?redirect=/checkout/${partidoId}`)}
                      className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="text-base">✏️</span> EDITAR MIS DATOS
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>

                {perfilIncompleto ? (
                  <div className="flex flex-col gap-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl flex items-center gap-4 mb-4">
                      <span className="text-3xl">⚠️</span>
                      <p className="text-amber-600 dark:text-amber-400 font-bold text-xs md:text-sm">
                        Tu perfil está incompleto. El Mundial exige validación de identidad oficial.
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push(`/profile?redirect=/checkout/${partidoId}`)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 md:py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-blue-500/20 text-base md:text-lg"
                    >
                      Completar mi Perfil Ahora →
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setPaso(2)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 md:py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-emerald-500/20 text-base md:text-lg hover:scale-[1.02] active:scale-[0.98]"
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
                  className="group flex items-center gap-3 bg-card hover:bg-blue-600 border-2 border-border hover:border-blue-600 text-foreground hover:text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 mb-10 shadow-md"
                >
                  <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                  Volver a Confirmación de Datos
                </button>

                <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4 uppercase italic tracking-tighter leading-none">
                  PASO 2: <span className="text-blue-600">UBICACIÓN</span>
                </h1>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-12 italic border-l-4 border-blue-600 pl-4">
                  Elige tu lugar en el estadio
                </p>

                <SectorSelector
                  partidoId={partidoId}
                  onComprar={(sectorId, sectorNombre, cantidad, total) => {
                    localStorage.setItem(`checkout_selection_${partidoId}`, JSON.stringify({ sectorId, sectorNombre, cantidad, total }));
                    setPaso(3);
                  }}
                />
              </div>
            )}

            {/* PASO 3: RESUMEN DE COMPRA */}
            {paso === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <button
                  onClick={() => setPaso(2)}
                  className="group flex items-center gap-3 bg-card hover:bg-blue-600 border-2 border-border hover:border-blue-600 text-foreground hover:text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 mb-10 shadow-md"
                >
                  <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                  Volver a Selección de Ubicación
                </button>

                <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4 uppercase italic tracking-tighter leading-none">
                  PASO 3: <span className="text-blue-600">RESUMEN</span>
                </h1>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-12 italic border-l-4 border-blue-600 pl-4">
                  Valida tu pedido antes de pagar
                </p>

                <div className="bg-background border-2 border-border rounded-[2rem] p-8 md:p-12 mb-12 shadow-inner">
                  {/* TICKET VISUAL */}
                  {(() => {
                    const sel = JSON.parse(localStorage.getItem(`checkout_selection_${partidoId}`) || '{}');
                    const precioUnit = sel.total && sel.cantidad ? (sel.total / sel.cantidad) : 0;
                    return (
                      <div className="relative">
                        {/* Ticket container */}
                        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
                          {/* Header del ticket */}
                          <div className="bg-blue-600 px-8 py-4 flex justify-between items-center">
                            <p className="text-white font-black text-xs uppercase tracking-widest">🌍 FIFA WORLD CUP 2026™</p>
                            <span className="bg-emerald-400 text-emerald-900 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">✓ VÁLIDA</span>
                          </div>

                          {/* Partido info */}
                          <div className="px-8 py-6 border-b border-white/10">
                            {partidoInfo ? (
                              <div className="flex items-center justify-center gap-6">
                                <div className="flex flex-col items-center gap-2">
                                  <Bandera pais={partidoInfo.equipoLocal} className="w-16 h-11 rounded-lg" />
                                  <p className="text-white font-black text-sm uppercase tracking-tight">{partidoInfo.equipoLocal}</p>
                                </div>
                                <p className="text-blue-400 font-black text-2xl italic">VS</p>
                                <div className="flex flex-col items-center gap-2">
                                  <Bandera pais={partidoInfo.equipoVisitante} className="w-16 h-11 rounded-lg" />
                                  <p className="text-white font-black text-sm uppercase tracking-tight">{partidoInfo.equipoVisitante}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-white font-black text-center uppercase">FIFA World Cup 2026™</p>
                            )}
                            {partidoInfo && (
                              <p className="text-blue-300 text-[10px] font-bold text-center mt-3 uppercase tracking-widest">
                                📍 {partidoInfo.nombreEstadio} • {partidoInfo.fase}
                              </p>
                            )}
                          </div>

                          {/* Divisor dentado */}
                          <div className="relative flex items-center px-4">
                            <div className="w-5 h-5 bg-background rounded-full -ml-6 shrink-0" />
                            <div className="flex-1 border-t-2 border-dashed border-white/20 mx-2" />
                            <div className="w-5 h-5 bg-background rounded-full -mr-6 shrink-0" />
                          </div>

                          {/* Titular */}
                          <div className="px-8 py-4 border-b border-white/10">
                            <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1">Titular</p>
                            <p className="text-white font-black text-lg uppercase">{datosUsuario?.nombre} {datosUsuario?.apellido}</p>
                            <p className="text-white/50 text-xs font-bold">Doc: {datosUsuario?.numeroPasaporte}</p>
                          </div>

                          {/* Detalles de compra */}
                          <div className="px-8 py-4 grid grid-cols-3 gap-4 border-b border-white/10">
                            <div>
                              <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1">Sector</p>
                              <p className="text-white font-black text-sm uppercase">{sel.sectorNombre || 'SECTOR'}</p>
                            </div>
                            <div>
                              <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1">Cantidad</p>
                              <p className="text-white font-black text-sm">{sel.cantidad} {sel.cantidad === 1 ? 'entrada' : 'entradas'}</p>
                            </div>
                            <div>
                              <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1">P. Unit.</p>
                              <p className="text-white font-black text-sm">${precioUnit.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Total + Botón */}
                          <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                              <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1">Total a Pagar</p>
                              <p className="text-5xl font-black text-white tracking-tighter">${sel.total?.toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => { void handleComprar(sel.sectorId); }}
                              className="relative group/pay overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/30"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/pay:animate-shimmer" />
                              ✅ CONFIRMAR Y PAGAR →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* TÉRMINOS Y CONDICIONES */}
                <div className="mt-8">
                  <button
                    onClick={() => { setMostrarTerminos(!mostrarTerminos); }}
                    className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-foreground transition-colors mx-auto"
                  >
                    Al confirmar, aceptas los Términos y Condiciones de TicketAR y FIFA
                    <span className={`transition-transform duration-300 inline-block ${mostrarTerminos ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {mostrarTerminos && (
                    <div className="mt-4 bg-background border border-border rounded-2xl p-5 text-xs text-muted-foreground space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div>
                        <p className="font-black text-foreground uppercase tracking-wider mb-2">📋 Al crear tu cuenta:</p>
                        <ul className="space-y-1 pl-3 list-disc list-inside">
                          <li>Una cuenta por persona — el email debe ser tuyo</li>
                          <li>El DNI/Pasaporte debe coincidir con tu documento físico oficial</li>
                          <li>No se permite falsificar datos de identidad</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-black text-foreground uppercase tracking-wider mb-2">🎟️ Al realizar una compra:</p>
                        <ul className="space-y-1 pl-3 list-disc list-inside">
                          <li>Máximo 6 entradas por cuenta y por partido</li>
                          <li>Los tickets son personales e intransferibles</li>
                          <li>No existe política de reembolso — la compra es definitiva</li>
                          <li>El titular debe presentar DNI/Pasaporte en la puerta del estadio</li>
                          <li>El ingreso será denegado si los datos no coinciden</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
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

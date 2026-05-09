'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SectorSelector from '@/components/checkout/SectorSelector';
import CountdownTimer from '@/components/CountdownTimer';
import {
  createTicket,
  getPartidos,
  getUsuario,
  pagarTicket,
  formatPrice,
  Sector,
  Usuario,
} from '@/lib/api';
import { checkoutEventBus } from '@/lib/checkout-event-bus';
import { Partido } from '@/types/ticket';

interface SeleccionCompra {
  sector: Sector;
  cantidad: number;
  total: number;
}

function redirigirPagoSeguro(urlPago: string): boolean {
  try {
    const url = new URL(urlPago, window.location.origin);
    const protocoloValido = url.protocol === 'https:' || url.protocol === 'http:';
    if (!protocoloValido) return false;
    window.location.assign(url.toString());
    return true;
  } catch {
    return false;
  }
}

function CheckoutContent({ partidoId }: { partidoId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const stepFromUrl = parseInt(searchParams.get('step') || '1');
  const [paso, setPaso] = useState(stepFromUrl); // 1: Datos, 2: Sectores
  const [procesando, setProcesando] = useState(false);
  const [fechaExpiracion] = useState<Date>(() => {
    if (typeof window === 'undefined') return new Date(Date.now() + 15 * 60 * 1000);
    const claveAlmacenamiento = `ticketar-reserva-${partidoId}`;
    const guardada = window.sessionStorage.getItem(claveAlmacenamiento);
    if (guardada && Number(guardada) > Date.now()) return new Date(Number(guardada));
    const nuevaFecha = Date.now() + 15 * 60 * 1000;
    window.sessionStorage.setItem(claveAlmacenamiento, String(nuevaFecha));
    return new Date(nuevaFecha);
  });
  const [datosUsuario, setDatosUsuario] = useState<Usuario | null>(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [seleccionCompra, setSeleccionCompra] = useState<SeleccionCompra | null>(null);
  const [mensajeError, setMensajeError] = useState('');
  const [reservaExpirada, setReservaExpirada] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<Partido | null>(
    null,
  );

  // Cargar datos del usuario para el Paso 1
  useEffect(() => {
    if (user?.emailAddresses[0]?.emailAddress) {
      getUsuario(user.emailAddresses[0].emailAddress, {
        userId: user.id,
        userEmail: user.emailAddresses[0].emailAddress,
      })
        .then(datos => {
          if (datos && datos.id) {
            setDatosUsuario(datos);
          } else {
            router.push('/profile?error=not_registered');
          }
          setCargandoUsuario(false);
        })
        .catch(() => {
          setMensajeError('No pudimos cargar tus datos. Revisá tu conexión e intentá nuevamente.');
          setCargandoUsuario(false);
        });
    }
  }, [user, router]);

  useEffect(() => {
    getPartidos()
      .then((partidos) => {
        const partido = partidos.find((item) => item.id === partidoId) ?? null;
        setPartidoSeleccionado(partido);
      })
      .catch(() => {
        setPartidoSeleccionado(null);
      });
  }, [partidoId]);

  useEffect(() => {
    const unsubscribe = checkoutEventBus.subscribe('TIEMPO_EXPIRADO', () => {
      setReservaExpirada(true);
      setMensajeError(
        'Tu reserva venció. Volvé a seleccionar partido y sector para continuar.',
      );
      setProcesando(false);
      window.sessionStorage.removeItem(`ticketar-reserva-${partidoId}`);
    });
    return unsubscribe;
  }, [partidoId]);

  const perfilIncompleto = !datosUsuario?.nombre ||
                           !datosUsuario?.apellido ||
                           !datosUsuario?.numeroPasaporte ||
                           !datosUsuario?.telefono ||
                           !datosUsuario?.provincia ||
                           !datosUsuario?.localidad;

  // Bloqueo de seguridad
  useEffect(() => {
    if (!cargandoUsuario && paso === 2 && perfilIncompleto) {
      router.push(`/profile?matchId=${partidoId}`);
    }
  }, [paso, perfilIncompleto, cargandoUsuario, router, partidoId]);

  function seleccionarCompra(sector: Sector, cantidad: number, total: number) {
    if (reservaExpirada) return;
    setSeleccionCompra({ sector, cantidad, total });
    setMensajeError('');
    setPaso(3);
  }

  function obtenerMensajePago(error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'No pudimos procesar el pago.';
    if (mensaje.includes('400')) {
      return 'Tu pago fue rechazado. Revisá los datos del medio de pago o intentá con otra tarjeta.';
    }
    if (mensaje.toLowerCase().includes('stock') || mensaje.toLowerCase().includes('asientos')) {
      return 'Ese sector se agotó mientras estabas comprando. Elegí otra ubicación disponible.';
    }
    return mensaje;
  }

  async function confirmarPago() {
    if (!seleccionCompra) return;
    if (reservaExpirada) {
      setMensajeError(
        'Tu reserva venció. Volvé a seleccionar partido y sector para continuar.',
      );
      return;
    }
    setProcesando(true);
    setMensajeError('');
    try {
      if (!datosUsuario?.id) throw new Error('Necesitamos validar tu perfil antes de reservar.');

      const entradasReservadas = [];
      for (let i = 0; i < seleccionCompra.cantidad; i += 1) {
        const entrada = await createTicket({
          idUsuario: datosUsuario.id,
          idPartido: partidoId,
          idSector: seleccionCompra.sector.id
        });
        entradasReservadas.push(entrada);
      }

      const respuestaPago = await pagarTicket(entradasReservadas[0].id);
      window.sessionStorage.removeItem(`ticketar-reserva-${partidoId}`);
      
      if (respuestaPago.resultadoPago?.paymentUrl) {
        const redireccionExitosa = redirigirPagoSeguro(respuestaPago.resultadoPago.paymentUrl);
        if (!redireccionExitosa) {
          throw new Error('El enlace de pago recibido no es valido.');
        }
      } else {
        router.push('/my-tickets');
      }
    } catch (error) {
      setMensajeError(obtenerMensajePago(error));
      setProcesando(false);
    }
  }

  if (cargandoUsuario) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-foreground font-black uppercase tracking-[0.4em] italic animate-pulse">Verificando Identidad...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen py-8 md:py-12 px-3 md:px-4 bg-background transition-colors duration-500 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl">
        
        {/* HEADER: INDICADOR DE PASOS Y TIMER */}
        <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center mb-8 md:mb-10 gap-4 md:gap-6">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-card px-4 md:px-8 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-sm">
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

          <div className="bg-black text-white p-2 rounded-2xl border-4 border-red-500/20 shadow-2xl">
              <div className="px-3 md:px-6 py-3 md:py-4 rounded-xl flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-red-400">Tiempo restante para abonar:</p>
                <CountdownTimer
                  tiempoExpiracion={fechaExpiracion}
                  onExpirar={() => {
                    checkoutEventBus.emit('TIEMPO_EXPIRADO');
                  }}
                />
              </div>
            </div>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-card border-2 border-border rounded-[2rem] md:rounded-[4rem] shadow-2xl relative overflow-hidden transition-all duration-500">
          
          <div className="p-6 md:p-12 lg:p-20">
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
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Nombre Completo</p>
                      <p className="text-2xl font-black text-foreground italic uppercase">
                        {datosUsuario?.nombre || '---'} {datosUsuario?.apellido || '---'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Documento (DNI/Pasaporte)</p>
                      <p className={`text-2xl font-black italic uppercase ${datosUsuario?.numeroPasaporte ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                        {datosUsuario?.numeroPasaporte || '❌ No cargado'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Email de Contacto</p>
                      <p className="text-2xl font-black text-foreground italic uppercase">{datosUsuario?.email || user?.emailAddresses[0]?.emailAddress}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Teléfono</p>
                      <p className={`text-2xl font-black italic uppercase ${datosUsuario?.telefono ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                        {datosUsuario?.telefono || '❌ No cargado'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Provincia</p>
                      <p className={`text-2xl font-black italic uppercase ${datosUsuario?.provincia ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                        {datosUsuario?.provincia || '❌ No cargado'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Localidad</p>
                      <p className={`text-2xl font-black italic uppercase ${datosUsuario?.localidad ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                        {datosUsuario?.localidad || '❌ No cargado'}
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
                    disabled={reservaExpirada}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-emerald-500/20 text-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {reservaExpirada ? 'Reserva vencida' : 'Confirmar Datos y Continuar →'}
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

                <SectorSelector partidoId={partidoId} alContinuarCompra={seleccionarCompra} />
              </div>
            )}

            {paso === 3 && seleccionCompra && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <button
                  onClick={() => setPaso(2)}
                  className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2 transition-colors group"
                >
                  <span className="group-hover:-translate-x-2 transition-transform">←</span> Modificar ubicación
                </button>

                <h1 className="text-4xl md:text-7xl font-black text-foreground mb-4 uppercase italic tracking-tighter leading-none">
                  PASO 3: <span className="text-emerald-600">CONFIRMAR</span>
                </h1>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-10 italic border-l-4 border-emerald-600 pl-4">
                  Revisá el importe y la cantidad antes de pagar
                </p>

                {mensajeError && (
                  <div className="mb-8 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm font-bold text-red-500">
                    {mensajeError}
                  </div>
                )}

                <section className="bg-background border-2 border-border rounded-[2rem] p-6 md:p-10 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Estás comprando</p>
                      <p className="text-2xl font-black italic text-foreground">
                        {seleccionCompra.cantidad} entradas - Sector {seleccionCompra.sector.nombre}
                      </p>
                      <p className="text-sm font-bold text-muted-foreground mt-2">
                        {partidoSeleccionado
                          ? `${partidoSeleccionado.equipo_local} vs ${partidoSeleccionado.equipo_visitante}`
                          : 'Partido seleccionado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Importe total</p>
                      <p className="text-4xl font-black italic text-emerald-600">
                        {formatPrice(seleccionCompra.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Titular</p>
                      <p className="font-black uppercase text-foreground">{datosUsuario?.nombre} {datosUsuario?.apellido}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Documento</p>
                      <p className="font-black uppercase text-foreground">{datosUsuario?.numeroPasaporte}</p>
                    </div>
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setPaso(2)}
                    className="sm:w-1/3 bg-muted text-foreground py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs"
                  >
                    Modificar
                  </button>
                  <button
                    onClick={() => { void confirmarPago(); }}
                    disabled={procesando || reservaExpirada}
                    className="sm:w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs disabled:opacity-60"
                  >
                    {reservaExpirada ? 'Reserva vencida' : 'Confirmar y pagar'}
                  </button>
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

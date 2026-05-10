'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SectorSelector from '@/components/checkout/SectorSelector';
import CountdownTimer from '@/components/CountdownTimer';
import { createTicket, getUsuario, pagarTicket, updateUsuario, getPartidos } from '@/lib/api';
import { Partido } from '@/types/ticket';
import Bandera from '@/components/Bandera';

interface Usuario {
  id: string;
  nombre?: string;
  apellido?: string;
  numeroPasaporte?: string;
  email?: string;
  telefono?: string;
  provincia?: string;
  localidad?: string;
}

function CheckoutContent({ partidoId }: { partidoId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const stepFromUrl = parseInt(searchParams.get('step') || '1');
  const [paso, setPaso] = useState(stepFromUrl); // 1: Datos, 2: Sectores, 3: Resumen
  const [procesando, setProcesando] = useState(false);
  const [fechaExpiracion, setFechaExpiracion] = useState<Date | null>(null);
  const [resumenCompra, setResumenCompra] = useState<{sectorId: string, cantidad: number, total: number} | null>(null);
  const [userData, setUserData] = useState<Usuario | null>(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [editandoDatos, setEditandoDatos] = useState(false);
  const [formData, setFormData] = useState({ telefono: '', provincia: '', localidad: '' });
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  // Cargar datos del usuario para el Paso 1
  useEffect(() => {
    if (user?.emailAddresses[0]?.emailAddress) {
      getUsuario(user.emailAddresses[0].emailAddress)
        .then(data => {
          if (data && data.id) {
            setUserData(data);
            setFormData({
              telefono: data.telefono || '',
              provincia: data.provincia || '',
              localidad: data.localidad || ''
            });
            if (!data.telefono || !data.provincia || !data.localidad || !data.numeroPasaporte) {
              setEditandoDatos(true);
            }
          } else {
            router.push('/profile?error=not_registered');
          }
          setCargandoUsuario(false);
        })
        .catch(() => {
          setCargandoUsuario(false);
        });
    }
  }, [user, router]);

  // Persistencia de Timer y Paso con LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTimer = localStorage.getItem(`checkout_timer_${partidoId}`);
      if (savedTimer) {
        const expirationDate = new Date(savedTimer);
        setTimeout(() => {
          if (expirationDate > new Date()) {
            setFechaExpiracion(expirationDate);
          } else {
            localStorage.removeItem(`checkout_timer_${partidoId}`);
            const nuevaFecha = new Date(Date.now() + 15 * 60 * 1000);
            setFechaExpiracion(nuevaFecha);
            localStorage.setItem(`checkout_timer_${partidoId}`, nuevaFecha.toISOString());
          }
        }, 0);
      } else {
        const nuevaFecha = new Date(Date.now() + 15 * 60 * 1000);
        setTimeout(() => {
          setFechaExpiracion(nuevaFecha);
          localStorage.setItem(`checkout_timer_${partidoId}`, nuevaFecha.toISOString());
        }, 0);
      }
      
      const savedPaso = localStorage.getItem(`checkout_paso_${partidoId}`);
      if (savedPaso) {
        setTimeout(() => setPaso(parseInt(savedPaso)), 0);
      }
      
      const savedResumen = localStorage.getItem(`checkout_resumen_${partidoId}`);
      if (savedResumen) {
        setTimeout(() => setResumenCompra(JSON.parse(savedResumen)), 0);
      }
    }
  }, [partidoId]);

  // Guardar estado actual
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`checkout_paso_${partidoId}`, paso.toString());
      if (resumenCompra) {
        localStorage.setItem(`checkout_resumen_${partidoId}`, JSON.stringify(resumenCompra));
      }
    }
  }, [paso, partidoId, resumenCompra]);

  const limpiarCheckout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`checkout_paso_${partidoId}`);
      localStorage.removeItem(`checkout_timer_${partidoId}`);
      localStorage.removeItem(`checkout_resumen_${partidoId}`);
    }
  };

  const perfilIncompleto = !userData?.nombre || 
                           !userData?.apellido || 
                           !userData?.numeroPasaporte || 
                           !userData?.telefono || 
                           !userData?.provincia || 
                           !userData?.localidad;

  // Bloqueo de seguridad
  useEffect(() => {
    if (!cargandoUsuario && paso === 2 && perfilIncompleto) {
      setTimeout(() => {
        setPaso(1);
        setEditandoDatos(true);
      }, 0);
    }
  }, [paso, perfilIncompleto, cargandoUsuario]);

  const handleGuardarDatos = async () => {
    if (!formData.telefono || !formData.provincia || !formData.localidad) {
      alert("Por favor completa todos los campos (Teléfono, Provincia, Localidad) para continuar.");
      return;
    }
    setGuardandoDatos(true);
    try {
      const email = user?.emailAddresses[0]?.emailAddress || '';
      const ok = await updateUsuario(email, { ...userData, ...formData } as Record<string, unknown>);
      if (ok) {
        setUserData({ ...(userData as Usuario), ...formData });
        setEditandoDatos(false);
      } else {
        alert("Error al guardar tus datos en el servidor.");
      }
    } catch {
      alert("Error de conexión al actualizar el perfil.");
    }
    setGuardandoDatos(false);
  };

  const handleSeleccionarSector = (sectorId: string, cantidad: number, total: number) => {
    setResumenCompra({ sectorId, cantidad, total });
    setPaso(3); // Avanzamos al Resumen
  };

  const handleComprarFinal = async () => {
    if (!resumenCompra) return;
    setProcesando(true);
    try {
      const ticketResponse = await createTicket({
        idUsuario: userData?.id || '',
        idPartido: partidoId,
        idSector: resumenCompra.sectorId,
        cantidad: resumenCompra.cantidad
      });
      
      const paymentResponse = await pagarTicket(ticketResponse.id);
      
      // Casteo de respuesta de pago
      const result = paymentResponse as unknown as { paymentResult?: { paymentUrl?: string } };
      
      if (result.paymentResult?.paymentUrl) {
        limpiarCheckout();
        window.location.href = result.paymentResult.paymentUrl;
      } else {
        limpiarCheckout();
        router.push('/my-tickets');
      }
    } catch (error) {
      // Mostrar el error real y claro
      const msg = error instanceof Error ? error.message : 'Hubo un error al procesar la reserva.';
      alert('Atención: ' + msg);
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
                <span className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-sm ${paso >= 3 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>3</span>
                <span className={`text-xs font-black uppercase tracking-widest ${paso === 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Resumen</span>
             </div>
          </div>

          {fechaExpiracion && (
            <div className="bg-black text-white p-2 rounded-2xl border-4 border-red-500/20 shadow-2xl">
              <div className="px-6 py-4 rounded-xl flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-red-400">Tiempo restante para abonar:</p>
                <CountdownTimer tiempoExpiracion={fechaExpiracion} onExpirar={() => { limpiarCheckout(); router.push('/'); }} />
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
                      {editandoDatos ? (
                         <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors" placeholder="Ej: +54 11 1234 5678" />
                      ) : (
                         <p className={`text-2xl font-black italic uppercase ${userData?.telefono ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                           {userData?.telefono || '❌ No cargado'}
                         </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Provincia</label>
                      {editandoDatos ? (
                         <input type="text" value={formData.provincia} onChange={e => setFormData({...formData, provincia: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors" placeholder="Ej: Buenos Aires" />
                      ) : (
                         <p className={`text-2xl font-black italic uppercase ${userData?.provincia ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                           {userData?.provincia || '❌ No cargado'}
                         </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Localidad</label>
                      {editandoDatos ? (
                         <input type="text" value={formData.localidad} onChange={e => setFormData({...formData, localidad: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors" placeholder="Ej: CABA" />
                      ) : (
                         <p className={`text-2xl font-black italic uppercase ${userData?.localidad ? 'text-foreground' : 'text-red-500 animate-pulse'}`}>
                           {userData?.localidad || '❌ No cargado'}
                         </p>
                      )}
                    </div>
                  </div>
                </div>

                {editandoDatos ? (
                  <div className="flex flex-col gap-4">
                    {perfilIncompleto && (
                      <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl flex items-center gap-4 mb-2">
                        <span className="text-3xl">ℹ️</span>
                        <p className="text-blue-400 font-bold text-sm">
                          Por favor, completa tus datos de contacto para finalizar la compra.
                        </p>
                      </div>
                    )}
                    <button 
                      onClick={handleGuardarDatos}
                      disabled={guardandoDatos}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-emerald-500/20 text-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {guardandoDatos ? "GUARDANDO..." : "GUARDAR DATOS Y CONTINUAR →"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={() => setEditandoDatos(true)}
                      className="md:w-1/3 bg-zinc-800 hover:bg-zinc-700 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all text-sm"
                    >
                      EDITAR MIS DATOS
                    </button>
                    <button 
                      onClick={() => setPaso(2)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-blue-500/20 text-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      CONTINUAR A UBICACIÓN →
                    </button>
                  </div>
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

                <SectorSelector partidoId={partidoId} onComprar={handleSeleccionarSector} />
              </div>
            )}

            {/* PASO 3: RESUMEN Y PAGO */}
            {paso === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <button 
                  onClick={() => setPaso(2)} 
                  className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2 transition-colors group"
                >
                  <span className="group-hover:-translate-x-2 transition-transform">←</span> Volver a Cambiar Ubicación
                </button>

                <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4 uppercase italic tracking-tighter leading-none">
                  PASO 3: <span className="text-emerald-600">CONFIRMACIÓN</span>
                </h1>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-12 italic border-l-4 border-emerald-600 pl-4">
                  Revisá los detalles de tu compra antes de abonar
                </p>

                <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <span className="text-9xl">🎟️</span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 border-b border-white/10 pb-4">
                    Resumen de Operación
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Titular de Entradas</p>
                      <p className="text-xl font-bold text-white uppercase">{userData?.nombre} {userData?.apellido}</p>
                      <p className="text-sm text-zinc-400 mt-1">DNI/Pasaporte: {userData?.numeroPasaporte}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Cantidad Seleccionada</p>
                      <p className="text-xl font-bold text-white uppercase">{resumenCompra?.cantidad} Entrada(s)</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Importe Final</p>
                      <p className="text-5xl font-black text-emerald-400 tracking-tighter italic">
                        ${resumenCompra?.total?.toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 pt-10 border-t border-white/10 flex flex-col items-center">
                    
                    <div className="flex items-start gap-4 mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl w-full">
                      <input 
                        type="checkbox" 
                        id="terminos_checkout" 
                        checked={terminosAceptados}
                        onChange={(e) => setTerminosAceptados(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-background cursor-pointer"
                      />
                      <label htmlFor="terminos_checkout" className="text-xs text-zinc-400 font-medium leading-relaxed cursor-pointer">
                        Acepto los <span className="text-blue-500 font-bold hover:underline">Términos y Condiciones</span> y asumo la responsabilidad sobre los datos ingresados. Confirmo que la compra es final y acato las políticas de la FIFA.
                      </label>
                    </div>

                    <button 
                      onClick={handleComprarFinal}
                      disabled={!terminosAceptados}
                      className="w-full md:w-auto px-16 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-emerald-500/20 text-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                    >
                      <span>Ir a Pagar</span>
                      <span className="text-2xl">💳</span>
                    </button>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Serás redirigido a Mercado Pago
                    </p>
                  </div>
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

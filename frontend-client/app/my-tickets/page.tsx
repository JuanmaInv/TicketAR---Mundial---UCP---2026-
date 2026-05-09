'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { getTickets, getUsuario, getTicketQr, getSectores, getPartidos, pagarTicket, Sector } from '@/lib/api';
import WorldCupLoader from '@/components/WorldCupLoader';
import { Partido, Ticket } from '@/types/ticket';

type EntradaApi = Ticket & {
  idUsuario?: string;
  id_usuario?: string;
  idSector?: string;
  id_sector?: string;
  idPartido?: string;
  id_partido?: string;
};

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

export default function MyTicketsPage() {
  const { user, isLoaded } = useUser();
  const [entradas, setEntradas] = useState<EntradaApi[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = useCallback(async () => {
    if (!user?.emailAddresses[0]?.emailAddress) return;
    
    try {
      const [datosUsuario, entradasApi, sectoresApi, partidosApi] = await Promise.all([
        getUsuario(user.emailAddresses[0].emailAddress, {
          userId: user.id,
          userEmail: user.emailAddresses[0].emailAddress,
        }),
        getTickets(),
        getSectores(),
        getPartidos()
      ]);

      if (datosUsuario?.id) {
        setSectores(sectoresApi);
        setPartidos(partidosApi);
        
        // Filtramos entradas del usuario que estén PAGADAS.
        const misEntradas = (entradasApi as EntradaApi[]).filter(t =>
          (t.idUsuario === datosUsuario.id || t.id_usuario === datosUsuario.id) &&
          (t.estado === 'PAGADO' || t.estado === 'vendido')
        );
        setEntradas(misEntradas);
      }
    } catch {
      setEntradas([]);
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        cargarDatos();
      } else {
        setCargando(false);
      }
    }
  }, [isLoaded, user, cargarDatos]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <WorldCupLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <h1 className="text-3xl font-black uppercase italic mb-4 text-foreground">Inicia sesión para ver tus entradas</h1>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Ir al Login</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-10 md:py-20 px-3 md:px-4 bg-background transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 md:mb-12 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-foreground mb-2">
              Mis <span className="text-blue-500">Entradas</span>
            </h1>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Acreditaciones oficiales FIFA 2026</p>
          </div>
          <button type="button" onClick={() => { void cargarDatos(); }} className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-foreground transition-colors">
            Actualizar Lista ↻
          </button>
        </header>

        {entradas.length === 0 ? (
          <div className="bg-card border border-border rounded-[2.5rem] p-12 text-center shadow-xl">
            <div className="text-6xl mb-6">🎟️</div>
            <h2 className="text-2xl font-black text-foreground mb-4 italic uppercase tracking-tight">Tu billetera está vacía</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto font-medium">
              No tienes reservas activas. El Mundial te espera, ¡no te quedes afuera!
            </p>
            <Link href="/matches" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
              Buscar Partidos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {entradas.map((entrada) => (
              <TicketCard 
                key={entrada.id}
                entrada={entrada}
                sectores={sectores} 
                partidos={partidos}
                alActualizar={cargarDatos}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function TicketCard({ entrada, sectores, partidos, alActualizar }: { entrada: EntradaApi, sectores: Sector[], partidos: Partido[], alActualizar: () => Promise<void> }) {
  const [qr, setQr] = useState<string | null>(null);
  const [verQr, setVerQr] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState('');

  const sector = sectores.find((s) => s.id === (entrada.idSector || entrada.id_sector));
  const partido = partidos.find((p) => p.id === (entrada.idPartido || entrada.id_partido));

  async function pagarEntrada() {
    setPagando(true);
    setMensajeAccion('');
    try {
      const respuesta = await pagarTicket(entrada.id);
      
      if (respuesta.resultadoPago?.paymentUrl) {
        const redireccionExitosa = redirigirPagoSeguro(respuesta.resultadoPago.paymentUrl);
        if (!redireccionExitosa) {
          throw new Error('El enlace de pago recibido no es valido.');
        }
        return;
      }

      setMensajeAccion('Pago procesado con éxito. Tu entrada ahora es válida.');
      void alActualizar();
    } catch {
      setMensajeAccion('No pudimos procesar el pago. Intentá nuevamente o probá otro medio de pago.');
    } finally {
      setPagando(false);
    }
  };

  const cargarQr = async () => {
    if (entrada.estado === 'PAGADO' || entrada.estado === 'vendido') {
      try {
        const dataUrl = await getTicketQr(entrada.id);
        setQr(dataUrl);
        setVerQr(true);
      } catch {
        setMensajeAccion('No pudimos generar el QR. Contactá a soporte si el problema continúa.');
      }
    } else {
      setMensajeAccion('Esta entrada todavía no fue abonada. Completá el pago para ver tu QR.');
    }
  }

  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row relative group hover:border-blue-600/30 transition-all duration-500 shadow-lg">
      {/* Decoración de Estado */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
        entrada.estado === 'PAGADO' || entrada.estado === 'vendido' ? 'bg-emerald-500' :
        entrada.estado === 'CANCELADO' ? 'bg-red-500' : 'bg-amber-500'
      }`} />

      <div className="p-8 flex-1 border-b md:border-b-0 md:border-r border-border">
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col gap-1">
            <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
              entrada.estado === 'PAGADO' || entrada.estado === 'vendido' ? 'bg-emerald-500/10 text-emerald-500' :
              entrada.estado === 'CANCELADO' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
            }`}>
              {entrada.estado}
            </span>
          </div>
          <span className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase">ENTRADA #{entrada.id.substring(0, 8)}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Partido</h3>
            <p className="text-xl font-black text-foreground italic uppercase leading-none">
              {partido ? `${partido.equipo_local} VS ${partido.equipo_visitante}` : 'Cargando encuentro...'}
            </p>
            <p className="text-muted-foreground text-xs font-bold mt-2 uppercase tracking-tighter italic">
              {partido ? partido.nombre_estadio : 'Estadio Oficial'}
            </p>
          </div>

          <div className="flex-1">
            <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Ubicación</h3>
            <p className="text-xl font-black text-blue-500 italic uppercase leading-none">
              {sector ? sector.nombre : 'Sector General'}
            </p>
            <p className="text-foreground/60 text-xs font-bold mt-2 uppercase tracking-tighter">
              {sector ? `ARS $${sector.precio.toLocaleString()}` : 'Precio Base'}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
           <div>
              <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">Titular de Cuenta</p>
              <p className="text-foreground text-xs font-bold italic">Acceso validado via Pasaporte</p>
           </div>
           
           {(entrada.estado === 'RESERVADO' || entrada.estado === 'reservado') && (
             <button
                type="button"
                onClick={() => { void pagarEntrada(); }}
                disabled={pagando}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 animate-pulse"
             >
                {pagando ? 'PROCESANDO...' : '💳 PAGAR AHORA'}
             </button>
           )}
        </div>
        {mensajeAccion && (
          <p className="mt-4 rounded-xl border border-border bg-background p-3 text-xs font-bold text-foreground">
            {mensajeAccion}
          </p>
        )}
      </div>

      <div className="p-6 md:p-10 bg-slate-100 dark:bg-black/40 flex flex-col items-center justify-center min-w-[220px] md:min-w-[280px] border-l border-border">
        {verQr && qr ? (
          <div className="bg-white p-3 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
            <Image src={qr} alt="QR Access" width={160} height={160} unoptimized />
            <p className="text-black text-[8px] font-black text-center mt-2 uppercase tracking-[0.3em]">Scannable at Gate</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { void cargarQr(); }}
            className="flex flex-col items-center gap-4 group"
          >
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-2xl ${
               entrada.estado === 'PAGADO' || entrada.estado === 'vendido'
               ? 'bg-blue-600 group-hover:bg-blue-500 group-hover:scale-110' 
               : 'bg-muted opacity-40 cursor-not-allowed'
            }`}>
              <span className="text-4xl">📱</span>
            </div>
            <div className="text-center">
              <span className={`text-[10px] font-black uppercase tracking-widest block transition-all ${
                entrada.estado === 'PAGADO' || entrada.estado === 'vendido' ? 'text-muted-foreground group-hover:text-foreground' : 'text-muted-foreground/60'
              }`}>
                {entrada.estado === 'PAGADO' || entrada.estado === 'vendido' ? 'Ver Código QR' : 'Esperando Pago'}
              </span>
              {entrada.estado !== 'PAGADO' && entrada.estado !== 'vendido' && (
                <span className="text-[8px] text-muted-foreground/40 font-bold uppercase mt-1 block tracking-tighter">Bloqueado por seguridad</span>
              )}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

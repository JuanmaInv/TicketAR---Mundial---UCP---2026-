'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { getTickets, getUsuario, getTicketQr, getSectores, getPartidos, pagarTicket } from '@/lib/api';
import WorldCupLoader from '@/components/WorldCupLoader';
import { Ticket, Partido, Sector } from '@/types/ticket';

export default function MyTicketsPage() {
  const { user, isLoaded } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = useCallback(async () => {
    if (!user?.emailAddresses[0]?.emailAddress) return;
    
    try {
      const [userData, allTickets, allSectores, allPartidos] = await Promise.all([
        getUsuario(user.emailAddresses[0].emailAddress),
        getTickets(),
        getSectores(),
        getPartidos()
      ]);

      if (userData?.id) {
        setSectores(allSectores);
        setPartidos(allPartidos);
        
        // Filtramos tickets del usuario que estén PAGADOS
        const myTickets = allTickets.filter(t => 
          (t.idUsuario === userData.id) && 
          (t.estado === 'PAGADO' || t.estado === 'vendido')
        );
        setTickets(myTickets);
      }
    } catch (err) {
      console.error('Error cargando datos de tickets:', err);
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
        <h1 className="text-3xl font-black uppercase italic mb-4 text-foreground">Inicia sesión para ver tus tickets</h1>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Ir al Login</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-20 px-4 bg-background transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase text-foreground mb-2">
              Mis <span className="text-blue-500">Entradas</span>
            </h1>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Acreditaciones oficiales FIFA 2026</p>
          </div>
          <button onClick={cargarDatos} className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-foreground transition-colors">
            Actualizar Lista ↻
          </button>
        </header>

        {tickets.length === 0 ? (
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
            {tickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                sectores={sectores} 
                partidos={partidos}
                onUpdate={cargarDatos}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function TicketCard({ ticket, sectores, partidos, onUpdate }: { ticket: Ticket, sectores: Sector[], partidos: Partido[], onUpdate: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const [verQr, setVerQr] = useState(false);
  const [pagando, setPagando] = useState(false);

  const sector = sectores.find(s => s.id === ticket.idSector);
  const partido = partidos.find(p => p.id === ticket.idPartido);

  const handlePago = async () => {
    if (!confirm('¿Deseas proceder con el pago de esta entrada? (Simulación de pasarela)')) return;
    
    setPagando(true);
    try {
      const response = await pagarTicket(ticket.id);
      
      if (response.paymentResult?.paymentUrl) {
        window.location.href = response.paymentResult.paymentUrl;
        return;
      }

      alert('¡Pago procesado con éxito! Tu ticket ahora es válido.');
      onUpdate();
    } catch {
      alert('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setPagando(false);
    }
  };

  const cargarQr = async () => {
    if (ticket.estado === 'PAGADO' || ticket.estado === 'vendido') {
      try {
        const dataUrl = await getTicketQr(ticket.id);
        setQr(dataUrl);
        setVerQr(true);
      } catch {
        alert('Error al generar el QR. Contacta a soporte.');
      }
    } else {
      alert('Esta entrada aún no ha sido abonada. Completa el pago para ver tu QR.');
    }
  };

  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row relative group hover:border-blue-600/30 transition-all duration-500 shadow-lg">
      {/* Decoración de Estado */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
        ticket.estado === 'PAGADO' || ticket.estado === 'vendido' ? 'bg-emerald-500' : 
        ticket.estado === 'CANCELADO' ? 'bg-red-500' : 'bg-amber-500'
      }`} />

      <div className="p-8 flex-1 border-b md:border-b-0 md:border-r border-border">
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col gap-1">
            <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
              ticket.estado === 'PAGADO' || ticket.estado === 'vendido' ? 'bg-emerald-500/10 text-emerald-500' : 
              ticket.estado === 'CANCELADO' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
            }`}>
              {ticket.estado}
            </span>
          </div>
          <span className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase">TICKET #{ticket.id.substring(0, 8)}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Partido</h3>
            <p className="text-xl font-black text-foreground italic uppercase leading-none">
              {partido ? `${partido.equipoLocal} VS ${partido.equipoVisitante}` : 'Cargando encuentro...'}
            </p>
            <p className="text-muted-foreground text-xs font-bold mt-2 uppercase tracking-tighter italic">
              {partido ? partido.nombreEstadio : 'Estadio Oficial'}
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
           
           {(ticket.estado === 'RESERVADO' || ticket.estado === 'reservado') && (
             <button 
                onClick={handlePago}
                disabled={pagando}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 animate-pulse"
             >
                {pagando ? 'PROCESANDO...' : '💳 PAGAR AHORA'}
             </button>
           )}
        </div>
      </div>

      <div className="p-10 bg-slate-100 dark:bg-black/40 flex flex-col items-center justify-center min-w-[280px] border-l border-border">
        {verQr && qr ? (
          <div className="bg-white p-3 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
            <Image src={qr} alt="QR Access" width={160} height={160} />
            <p className="text-black text-[8px] font-black text-center mt-2 uppercase tracking-[0.3em]">Scannable at Gate</p>
          </div>
        ) : (
          <button 
            onClick={cargarQr}
            className="flex flex-col items-center gap-4 group"
          >
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-2xl ${
               ticket.estado === 'PAGADO' || ticket.estado === 'vendido' 
               ? 'bg-blue-600 group-hover:bg-blue-500 group-hover:scale-110' 
               : 'bg-muted opacity-40 cursor-not-allowed'
            }`}>
              <span className="text-4xl">📱</span>
            </div>
            <div className="text-center">
              <span className={`text-[10px] font-black uppercase tracking-widest block transition-all ${
                ticket.estado === 'PAGADO' || ticket.estado === 'vendido' ? 'text-muted-foreground group-hover:text-foreground' : 'text-muted-foreground/60'
              }`}>
                {ticket.estado === 'PAGADO' || ticket.estado === 'vendido' ? 'Ver Código QR' : 'Esperando Pago'}
              </span>
              {ticket.estado !== 'PAGADO' && ticket.estado !== 'vendido' && (
                <span className="text-[8px] text-muted-foreground/40 font-bold uppercase mt-1 block tracking-tighter">Bloqueado por seguridad</span>
              )}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

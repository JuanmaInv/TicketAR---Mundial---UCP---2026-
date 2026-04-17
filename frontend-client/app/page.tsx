'use client';

import { useEffect, useState } from 'react';
import { getTickets } from '../lib/api';
import { Ticket } from '../types/ticket';

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets().then((data) => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
          Próximos <span className="text-blue-500">Partidos</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
          Reserva tus entradas para la Copa del Mundo 2026. Selección de asientos en tiempo real y confirmación inmediata.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="group glass flex flex-col overflow-hidden rounded-2xl p-6 transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
                  En Venta
                </span>
                <span className="text-2xl font-bold text-white">
                  ${ticket.precio}
                </span>
              </div>
              
              <h3 className="mb-2 text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                {ticket.partidoId}
              </h3>
              
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {ticket.sector}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Junio 2026
                </div>
              </div>
              
              <button className="mt-auto w-full rounded-xl bg-white/5 py-3 text-sm font-bold text-white transition-all hover:bg-blue-600">
                Reservar Ahora
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

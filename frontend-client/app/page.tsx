'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import WorldCupLoader from '@/components/WorldCupLoader';
import { getTickets } from '../lib/api';
import { Ticket } from '../types/ticket';
import Bandera from '@/components/Bandera';

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets().then((data) => {
      // Filtramos solo los disponibles para comprar
      setTickets(data.filter(t => t.estado === 'disponible'));
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl text-slate-900 dark:text-white drop-shadow-sm">
          Próximos <span className="text-[var(--usa-blue)]">Partidos</span>
        </h1>
      </div>

      {loading ? (
        <WorldCupLoader />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="group glass flex flex-col overflow-hidden rounded-2xl p-6 transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-slate-800"
            >
              {/* Imagen/Representación visual del partido (con las banderas de fondo) */}
              <div className="h-40 mb-4 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden border border-gray-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group-hover:border-[var(--canada-red)] transition-colors">
                {ticket.partidoId.includes(' vs ') ? (
                  <>
                    <div className="absolute inset-0 flex w-full h-full">
                      <div className="w-1/2 h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                        <Bandera pais={ticket.partidoId.split(' vs ')[0]} fill={true} />
                      </div>
                      <div className="w-1/2 h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                        <Bandera pais={ticket.partidoId.split(' vs ')[1]} fill={true} />
                      </div>
                    </div>

                    {/* Degradado para oscurecer las banderas y mejorar la legibilidad del texto blanco sobre ellas */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/80 z-10"></div>

                    <div className="flex items-center justify-center gap-4 z-20 w-full px-4 relative">
                      <span className="font-black text-white text-2xl tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] shadow-black">
                        {ticket.partidoId.split(' vs ')[0].slice(0, 3).toUpperCase()}
                      </span>

                      <span className="text-sm text-[var(--gold)] font-black italic tracking-widest px-4 py-2 rounded-full bg-white/90 border border-[var(--gold)] backdrop-blur-md shadow-xl">
                        VS
                      </span>

                      <span className="font-black text-white text-2xl tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] shadow-black">
                        {ticket.partidoId.split(' vs ')[1].slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                  </>
                ) : (
                  <svg className="w-12 h-12 text-slate-300 z-20 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )}
                {/* Decoración de fondo */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay z-10 pointer-events-none"></div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-[var(--mexico-green)]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--mexico-green)]">
                  En Venta
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${ticket.precio}
                </span>
              </div>

              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-[var(--usa-blue)] transition-colors">
                {ticket.partidoId}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-200 mb-6 flex-grow">
                Ticket oficial para la Copa Mundial 2026. Sector exclusivo: <strong className="text-slate-900 dark:text-white">{ticket.sector}</strong>. No te pierdas este encuentro histórico.
              </p>

              {/* Botón de acción */}
              <Link
                href={`/checkout/${ticket.id}`}
                className="mt-auto w-full text-center block rounded-xl bg-slate-100 dark:bg-slate-800 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-[var(--usa-blue)] dark:hover:bg-[var(--usa-blue)] hover:text-white border border-gray-200 dark:border-slate-700 hover:border-transparent dark:hover:border-transparent"
              >
                Seleccionar y Comprar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

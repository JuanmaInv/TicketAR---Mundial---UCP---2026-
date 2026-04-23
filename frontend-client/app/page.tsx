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
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
          Próximos <span className="text-blue-500">Partidos</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
          Reserva tus entradas para la Copa del Mundo 2026. Selección de asientos en tiempo real y confirmación inmediata.
        </p>
      </div>

      {loading ? (
        <WorldCupLoader />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="group glass flex flex-col overflow-hidden rounded-2xl p-6 transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10"
            >
              {/* Imagen/Representación visual del partido (con las banderas de fondo) */}
              <div className="h-40 mb-4 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden border border-white/10 bg-black group-hover:border-white/20 transition-colors">
                {ticket.partidoId.includes(' vs ') ? (
                  <>
                    <div className="absolute inset-0 flex w-full h-full">
                      <div className="w-1/2 h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                        <Bandera pais={ticket.partidoId.split(' vs ')[0]} fill={true} />
                      </div>
                      <div className="w-1/2 h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                        <Bandera pais={ticket.partidoId.split(' vs ')[1]} fill={true} />
                      </div>
                    </div>
                    
                    {/* Degradado para oscurecer las banderas y mejorar la legibilidad */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/90 z-10"></div>
                    
                    <div className="flex items-center justify-center gap-4 z-20 w-full px-4 relative">
                      <span className="font-black text-white text-2xl tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,1)] shadow-black">
                        {ticket.partidoId.split(' vs ')[0].slice(0, 3).toUpperCase()}
                      </span>

                      <span className="text-sm text-yellow-400 font-black italic tracking-widest px-4 py-2 rounded-full bg-black/80 border border-yellow-500/50 backdrop-blur-md shadow-2xl">
                        VS
                      </span>

                      <span className="font-black text-white text-2xl tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,1)] shadow-black">
                        {ticket.partidoId.split(' vs ')[1].slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                  </>
                ) : (
                  <svg className="w-12 h-12 text-white/30 z-20 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )}
                {/* Decoración de fondo para que parezca un estadio/cancha de noche */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay z-10 pointer-events-none"></div>
              </div>

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

              <p className="text-sm text-zinc-400 mb-6 flex-grow">
                Ticket oficial para la Copa Mundial 2026. Sector exclusivo: <strong className="text-white">{ticket.sector}</strong>. No te pierdas este encuentro histórico.
              </p>

              {/* Botón de acción (Requerimiento Paso 1) con Enrutamiento */}
              <Link
                href={`/checkout/${ticket.id}`}
                className="mt-auto w-full text-center block rounded-xl bg-white/5 py-3 text-sm font-bold text-white transition-all hover:bg-blue-600 border border-white/10 hover:border-transparent"
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

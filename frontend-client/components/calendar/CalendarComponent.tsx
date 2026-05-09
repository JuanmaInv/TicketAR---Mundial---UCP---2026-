'use client';

import React, { useState, useEffect } from 'react';
import Bandera from '../Bandera';
import { getPartidos, getSectores, formatPrice, Sector } from '@/lib/api';
import { Partido } from '@/types/ticket';
import Link from 'next/link';

export default function CalendarComponent() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [p, s] = await Promise.all([getPartidos(), getSectores()]);
        setPartidos(p);
        setSectores(s);
      } catch {
        setMensajeError('No pudimos cargar el calendario de partidos.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function getPrecioReal(matchId: string, precioBase: number): number {
    const sectoresValidos = sectores.filter(s => {
      const n = s.nombre.toLowerCase();
      return (n.includes('palco') || n.includes('platea') || n.includes('popular')) && s.precio > 0;
    });
    if (sectoresValidos.length > 0) {
      const precios = sectoresValidos.map(s => s.precio);
      return Math.min(...precios);
    }
    return precioBase;
  }

  function normalizeTeamLabel(label: string): string {
    if (!label) return "TBD";
    return label.replace(/_/g, " ").toUpperCase();
  }

  if (loading) return null;

  if (mensajeError) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm font-bold text-red-500">
        {mensajeError}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-colors duration-700">
      {Array.from({ length: 28 }).map((_, i) => {
        const dia = i + 1;
        
        // Filtrar partidos por el día de la fecha_partido
        const partidosDelDia = partidos.filter(p => {
          if (!p.fecha_partido) return false;
          try {
            const fecha = new Date(p.fecha_partido);
            // Si la fecha es válida, comparamos el día
            // (Asumimos que el calendario es para el mes actual de los partidos)
            return fecha.getDate() === dia;
          } catch {
            return false;
          }
        });

        return (
          <div key={dia} className="min-h-[200px] bg-white dark:bg-slate-900/60 p-4 transition-all duration-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-r border-b border-slate-100 dark:border-white/5">
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 italic">
              {dia}
            </span>
            
            <div className="mt-4 space-y-3">
              {partidosDelDia.map(partido => {
                const precio = getPrecioReal(partido.id, partido.precio_base);
                return (
                  <Link 
                    key={partido.id}
                    href={`/checkout/${partido.id}`}
                    className="block bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-xl p-3 shadow-sm hover:scale-105 transition-transform"
                  >
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[7px] font-black uppercase text-slate-400">Grupos</span>
                       <span className="text-[7px] font-bold text-blue-500">21:00</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <Bandera pais={normalizeTeamLabel(partido.equipo_local)} className="w-6 h-4" />
                      <span className="text-[8px] font-black text-slate-400">VS</span>
                      <Bandera pais={normalizeTeamLabel(partido.equipo_visitante)} className="w-6 h-4" />
                    </div>
                    <p className="text-[8px] font-black text-blue-600 dark:text-blue-400 text-center uppercase tracking-tighter">
                      Desde {formatPrice(precio)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

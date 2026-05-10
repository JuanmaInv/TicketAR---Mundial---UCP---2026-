'use client';

import React, { useState, useEffect } from 'react';
import Bandera from '../Bandera';
import { getPartidos, getSectoresDeTodosLosPartidos, formatPrice, SectorPorPartido } from '@/lib/api';
import { Partido } from '@/types/ticket';
import Link from 'next/link';

export default function CalendarComponent() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [sectoresPorPartido, setSectoresPorPartido] = useState<Record<string, SectorPorPartido[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, s] = await Promise.all([getPartidos(), getSectoresDeTodosLosPartidos()]);
        setPartidos(p);
        
        const mapaSectores: Record<string, SectorPorPartido[]> = {};
        s.forEach(item => {
          mapaSectores[item.idPartido] = item.sectores;
        });
        setSectoresPorPartido(mapaSectores);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getPrecioMinimoReal = (matchId: string) => {
    const sectoresDelPartido = sectoresPorPartido[matchId] || [];
    
    // Filtrar sectores que tengan stock > 0
    const sectoresDisponibles = sectoresDelPartido.filter(s => s.asientosDisponibles > 0);
    
    if (sectoresDisponibles.length > 0) {
      const precios = sectoresDisponibles.map(s => s.precio);
      return Math.min(...precios);
    }
    
    if (sectoresDelPartido.length > 0) {
      const precios = sectoresDelPartido.map(s => s.precio);
      return Math.min(...precios);
    }
    
    return 0;
  };

  const normalizeTeamLabel = (label: string) => {
    if (!label) return "TBD";
    return label.replace(/_/g, " ").toUpperCase();
  };

  if (loading) return null;

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
          } catch (e) {
            return false;
          }
        });

        return (
          <div key={i} className="min-h-[200px] bg-white dark:bg-slate-900/60 p-4 transition-all duration-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-r border-b border-slate-100 dark:border-white/5">
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 italic">
              {dia}
            </span>
            
            <div className="mt-4 space-y-3">
              {partidosDelDia.map(partido => {
                const precio = getPrecioMinimoReal(partido.id);
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

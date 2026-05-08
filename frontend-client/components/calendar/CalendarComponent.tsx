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
  const [mesActual, setMesActual] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, s] = await Promise.all([getPartidos(), getSectores()]);
        setPartidos(p);
        setSectores(s);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getMinPrecio = () => {
    const validos = sectores.filter(s => {
      const n = s.nombre.toLowerCase();
      return (n.includes('palco') || n.includes('platea') || n.includes('popular')) && s.precio > 0;
    });
    return validos.length > 0 ? Math.min(...validos.map(s => s.precio)) : 0;
  };

  const normalizeTeamLabel = (label: string) => {
    if (!label) return 'TBD';
    return label.replace(/_/g, ' ');
  };

  // Agrupar por fecha
  const porFecha = partidos.reduce<Record<string, Partido[]>>((acc, p) => {
    const fecha = p.fechaPartido ? new Date(p.fechaPartido).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }) : 'Fecha por confirmar';
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(p);
    return acc;
  }, {});

  const fechas = Object.keys(porFecha);
  const MESES_POR_PAGINA = 3;
  const inicio = mesActual * MESES_POR_PAGINA;
  const fechasVisibles = fechas.slice(inicio, inicio + MESES_POR_PAGINA);
  const minPrecio = getMinPrecio();

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (partidos.length === 0) return (
    <div className="text-center py-20 text-muted-foreground font-bold uppercase tracking-widest">
      No hay partidos disponibles en este momento.
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Navegación */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setMesActual(Math.max(0, mesActual - 1))}
          disabled={mesActual === 0}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl font-black text-xs uppercase tracking-widest text-foreground hover:border-blue-500 transition-all disabled:opacity-30"
        >
          ← Anterior
        </button>
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          {inicio + 1}–{Math.min(inicio + MESES_POR_PAGINA, fechas.length)} de {fechas.length} fechas
        </p>
        <button
          onClick={() => setMesActual(mesActual + 1)}
          disabled={inicio + MESES_POR_PAGINA >= fechas.length}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl font-black text-xs uppercase tracking-widest text-foreground hover:border-blue-500 transition-all disabled:opacity-30"
        >
          Siguiente →
        </button>
      </div>

      {/* Lista de fechas */}
      {fechasVisibles.map((fecha) => (
        <div key={fecha} className="space-y-3">
          {/* Cabecera de fecha */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest capitalize">
              📅 {fecha}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Partidos del día */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {porFecha[fecha].map((partido) => (
              <Link
                key={partido.id}
                href={`/checkout/${partido.id}`}
                className="group bg-card border border-border hover:border-blue-500 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                {/* Fase badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-blue-600/10 text-blue-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {partido.fase || 'Grupos'}
                  </span>
                  <span className="text-muted-foreground text-[10px] font-bold uppercase">🟢 Disponible</span>
                </div>

                {/* Equipos */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <Bandera pais={normalizeTeamLabel(partido.equipoLocal)} className="w-12 h-8 rounded-lg shadow-md" />
                    <p className="text-foreground font-black text-xs uppercase text-center leading-tight">
                      {normalizeTeamLabel(partido.equipoLocal)}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-blue-500 font-black text-lg italic">VS</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <Bandera pais={normalizeTeamLabel(partido.equipoVisitante)} className="w-12 h-8 rounded-lg shadow-md" />
                    <p className="text-foreground font-black text-xs uppercase text-center leading-tight">
                      {normalizeTeamLabel(partido.equipoVisitante)}
                    </p>
                  </div>
                </div>

                {/* Estadio + precio */}
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase truncate max-w-[60%]">
                    📍 {partido.nombreEstadio || 'Estadio Oficial'}
                  </p>
                  <p className="text-blue-500 font-black text-sm">
                    Desde {formatPrice(minPrecio || partido.precioBase)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

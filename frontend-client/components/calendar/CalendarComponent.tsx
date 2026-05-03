'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPartidos } from '@/lib/api';
import { Partido } from '@/types/ticket';
import Bandera from '@/components/Bandera';
import { useUser } from '@clerk/nextjs';

const TEAM_LABEL_ALIASES: Record<string, string> = {
  "UEFA Playoff A": "Bosnia",
  "UEFA Playoff B": "Suecia",
  "UEFA Playoff C": "Turquía",
  "UEFA Playoff D": "República Checa",
  "Intercontinental 1": "RD Congo",
  "Intercontinental 2": "Irak",
};

function normalizeTeamLabel(team: string) {
  return TEAM_LABEL_ALIASES[team] ?? team;
}

export default function ComponenteCalendario() {
  const { isSignedIn, isLoaded } = useUser();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [fechaActual, setFechaActual] = useState(new Date(2026, 5, 1));
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getPartidos()
      .then(datos => {
        setPartidos(datos);
        setCargando(false);
      })
      .catch(error => {
        console.error(error);
        setCargando(false);
      });
  }, []);

  const cambiarMes = (desplazamiento: number) => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + desplazamiento, 1));
  };

  const diasEnMes = (anio: number, mes: number) => new Date(anio, mes + 1, 0).getDate();
  const primerDiaDelMes = (anio: number, mes: number) => new Date(anio, mes, 1).getDay();

  const nombreMes = fechaActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const totalDias = diasEnMes(fechaActual.getFullYear(), fechaActual.getMonth());
  const diaInicio = primerDiaDelMes(fechaActual.getFullYear(), fechaActual.getMonth());

  const dias = [];

  for (let i = 0; i < diaInicio; i++) {
    dias.push(
      <div key={`vacio-${i}`} className="min-h-[140px] border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/10"></div>
    );
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const cadenaFecha = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const partidosDelDia = partidos.filter(p => p.fecha_partido?.startsWith(cadenaFecha));

    dias.push(
      <div key={dia} className="min-h-[140px] border border-slate-200 dark:border-slate-700/60 p-2 flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors">{dia}</span>

        <div className="mt-2 space-y-2 flex-grow overflow-y-auto custom-scrollbar">
          {cargando ? (
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
          ) : partidosDelDia.length > 0 ? (
            partidosDelDia.map(partido => {
              // Forzamos el paso por "Mis Datos" antes de comprar
              const destino = isSignedIn 
                ? `/profile?redirect=/checkout/${partido.id}` 
                : `/login?redirect=/profile?redirect=/checkout/${partido.id}`;
              
              const localTeam = normalizeTeamLabel(partido.equipo_local);
              const awayTeam = normalizeTeamLabel(partido.equipo_visitante);

              return (
                <Link
                  key={partido.id}
                  href={destino}
                  className="block p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shrink-0 hover:border-blue-500 hover:shadow-md transition-all shadow-sm"
                  title={`${localTeam} vs ${awayTeam} - ${partido.nombre_estadio}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-700 px-1 rounded">{partido.fase}</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                      {new Date(partido.fecha_partido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 w-2/5">
                      <Bandera pais={localTeam} />
                      <span className="text-[10px] font-bold truncate">{localTeam.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-300 dark:text-slate-500 italic">VS</span>
                    <div className="flex items-center gap-1 w-2/5 justify-end">
                      <span className="text-[10px] font-bold truncate">{awayTeam.substring(0, 3).toUpperCase()}</span>
                      <Bandera pais={awayTeam} />
                    </div>
                  </div>
                  {/* Etiqueta de precio ARS */}
                  <div className="mt-2 text-[9px] font-bold text-green-600 dark:text-green-400 text-center border-t border-slate-100 dark:border-slate-700 pt-1">
                    DESDE ARS $1
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-[10px] text-slate-400 italic text-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Sin partidos</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl">
      <div className="p-6 bg-slate-950 text-white flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
            Calendario <span className="text-blue-500">Mundial 2026</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {isSignedIn ? 'Selecciona tu partido y reserva en pesos' : 'Inicia sesión para ver precios y reservar'}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/50 p-2 rounded-full border border-white/10">
          <button onClick={() => cambiarMes(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors font-bold">←</button>
          <span className="font-bold uppercase tracking-widest text-sm min-w-[120px] text-center">{nombreMes}</span>
          <button onClick={() => cambiarMes(1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors font-bold">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(diaSemana => (
          <div key={diaSemana} className="py-4 text-center text-xs font-black uppercase tracking-widest text-slate-500">{diaSemana}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dias}
      </div>
    </div>
  );
}

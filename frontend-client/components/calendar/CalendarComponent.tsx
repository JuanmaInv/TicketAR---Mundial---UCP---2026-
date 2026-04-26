'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPartidos } from '@/lib/api';
import { Partido } from '@/types/ticket';
import Bandera from '@/components/Bandera';

export default function ComponenteCalendario() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  // Mundial 2026 empieza el 11 de Junio de 2026. Seteamos Junio como default.
  const [fechaActual, setFechaActual] = useState(new Date(2026, 5, 1)); 
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // getPartidos se conecta al backend real en el puerto 3000
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
  
  // Espacios vacíos antes del primer día del mes
  for (let i = 0; i < diaInicio; i++) {
    dias.push(
      <div key={`vacio-${i}`} className="min-h-[140px] border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/10"></div>
    );
  }

  // Días del mes
  for (let dia = 1; dia <= totalDias; dia++) {
    // Formato de fecha para coincidir con las fechas del backend formato ISO "YYYY-MM-DD"
    const cadenaFecha = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    
    // Filtrar partidos que ocurran este día
    const partidosDelDia = partidos.filter(p => {
      // asumiendo que fecha_partido es ISO: "2026-06-11T16:00:00Z" o similar
      return p.fecha_partido.startsWith(cadenaFecha);
    });

    dias.push(
      <div key={dia} className="min-h-[140px] border border-slate-200 dark:border-slate-700/60 p-2 flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors">{dia}</span>
        
        <div className="mt-2 space-y-2 flex-grow overflow-y-auto custom-scrollbar">
          {cargando ? (
             <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
          ) : partidosDelDia.length > 0 ? (
            partidosDelDia.map(partido => (
              <Link 
                key={partido.id} 
                href={`/checkout/${partido.id}`}
                className="block p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shrink-0 hover:border-blue-500 hover:shadow-md transition-all shadow-sm"
                title={`${partido.equipo_local} vs ${partido.equipo_visitante} - ${partido.nombre_estadio}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-700 px-1 rounded">{partido.fase}</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                    {new Date(partido.fecha_partido).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 w-2/5">
                    <Bandera pais={partido.equipo_local} />
                    <span className="text-[10px] font-bold truncate">{partido.equipo_local.substring(0,3).toUpperCase()}</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-300 dark:text-slate-500 italic">VS</span>
                  <div className="flex items-center gap-1 w-2/5 justify-end">
                    <span className="text-[10px] font-bold truncate">{partido.equipo_visitante.substring(0,3).toUpperCase()}</span>
                    <Bandera pais={partido.equipo_visitante} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-[10px] text-slate-400 italic text-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Sin partidos</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl">
      {/* Cabecera del Calendario */}
      <div className="p-6 bg-slate-950 text-white flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
            Calendario <span className="text-blue-500">Mundial 2026</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">Selecciona un partido para comenzar la reserva</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-950/50 p-2 rounded-full border border-white/10">
          <button 
            onClick={() => cambiarMes(-1)} 
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-xl font-bold"
            aria-label="Mes anterior"
          >
            ←
          </button>
          <span className="font-bold uppercase tracking-widest text-sm min-w-[120px] text-center">
            {nombreMes}
          </span>
          <button 
            onClick={() => cambiarMes(1)} 
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-xl font-bold"
            aria-label="Mes siguiente"
          >
            →
          </button>
        </div>
      </div>

      {/* Días de la Semana */}
      <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(diaSemana => (
          <div key={diaSemana} className="py-4 text-center text-xs font-black uppercase tracking-widest text-slate-500">
            {diaSemana}
          </div>
        ))}
      </div>

      {/* Grilla del Calendario */}
      <div className="grid grid-cols-7">
        {dias}
      </div>
    </div>
  );
}

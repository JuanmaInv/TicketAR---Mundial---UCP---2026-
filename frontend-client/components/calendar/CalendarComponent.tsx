'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Bandera from '../Bandera';
import {
  formatPrice,
  getPartidos,
  getSectoresDeTodosLosPartidos,
  SectorPorPartido,
} from '@/lib/api';
import { Partido } from '@/types/ticket';

type EstadoVisual = 'disponible' | 'agotado' | 'cancelado';

type CalendarComponentProps = {
  esAdmin?: boolean;
};

export default function CalendarComponent({ esAdmin = false }: CalendarComponentProps) {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [sectoresPorPartido, setSectoresPorPartido] = useState<Record<string, SectorPorPartido[]>>({});
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState('');

  function obtenerSectoresPorPartidoSeguro(matchId: string): SectorPorPartido[] {
    if (Object.prototype.hasOwnProperty.call(sectoresPorPartido, matchId)) {
      return sectoresPorPartido[matchId] ?? [];
    }
    return [];
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [dataPartidos, dataSectores] = await Promise.all([
          getPartidos(),
          getSectoresDeTodosLosPartidos(),
        ]);

        setPartidos(dataPartidos);

        const mapaSectores: Record<string, SectorPorPartido[]> = {};
        dataSectores.forEach((item) => {
          mapaSectores[item.idPartido] = item.sectores;
        });
        setSectoresPorPartido(mapaSectores);
      } catch {
        setMensajeError('No pudimos cargar el calendario de partidos.');
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  function getEstadoVisual(match: Partido): EstadoVisual {
    const estado = (match.estado || '').trim().toLowerCase();
    if (estado === 'cancelado') return 'cancelado';
    if (estado === 'agotado') return 'agotado';

    const sectoresDelPartido = obtenerSectoresPorPartidoSeguro(match.id);
    const hayStockReal = sectoresDelPartido.some((s) => s.asientosDisponibles > 0);
    if (!hayStockReal) return 'agotado';

    return 'disponible';
  }

  function getPrecioMinimoReal(matchId: string): number {
    const sectoresDelPartido = obtenerSectoresPorPartidoSeguro(matchId);
    const sectoresDisponibles = sectoresDelPartido.filter((s) => s.asientosDisponibles > 0);

    if (sectoresDisponibles.length > 0) {
      return Math.min(...sectoresDisponibles.map((s) => s.precio));
    }

    if (sectoresDelPartido.length > 0) {
      return Math.min(...sectoresDelPartido.map((s) => s.precio));
    }

    return 0;
  }

  function normalizeTeamLabel(label: string): string {
    if (!label) return 'TBD';
    return label.replace(/_/g, ' ').toUpperCase();
  }

  function formatearHora(fechaPartido: string): string {
    const fecha = new Date(fechaPartido);
    if (Number.isNaN(fecha.getTime())) return '--:--';
    return fecha.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
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

        const partidosDelDia = partidos.filter((p) => {
          if (!p.fecha_partido) return false;
          const fecha = new Date(p.fecha_partido);
          if (Number.isNaN(fecha.getTime())) return false;
          return fecha.getDate() === dia;
        });

        return (
          <div
            key={dia}
            className="min-h-[200px] bg-white dark:bg-slate-900/60 p-4 transition-all duration-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-r border-b border-slate-100 dark:border-white/5"
          >
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 italic">
              {dia}
            </span>

            <div className="mt-4 space-y-3">
              {partidosDelDia.map((partido) => {
                const precio = getPrecioMinimoReal(partido.id);
                const estadoVisual = getEstadoVisual(partido);
                const noDisponible = estadoVisual !== 'disponible';

                const tarjeta = (
                  <div className="block bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-xl p-3 shadow-sm hover:scale-105 transition-transform">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[7px] font-black uppercase text-slate-400">
                        {partido.fase || 'Fase'}
                      </span>
                      <span className="text-[7px] font-bold text-blue-500">
                        {formatearHora(partido.fecha_partido)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <Bandera pais={normalizeTeamLabel(partido.equipo_local)} className="w-6 h-4" />
                      <span className="text-[8px] font-black text-slate-400">VS</span>
                      <Bandera pais={normalizeTeamLabel(partido.equipo_visitante)} className="w-6 h-4" />
                    </div>
                    <p className="text-[8px] font-black text-blue-600 dark:text-blue-400 text-center uppercase tracking-tighter">
                      Tickets desde {formatPrice(precio)}
                    </p>
                    <p
                      className={`mt-1 text-[7px] font-black text-center uppercase tracking-widest ${
                        estadoVisual === 'disponible'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : estadoVisual === 'cancelado'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {estadoVisual}
                    </p>
                  </div>
                );

                if (noDisponible || esAdmin) {
                  return <div key={partido.id}>{tarjeta}</div>;
                }

                return (
                  <Link key={partido.id} href={`/checkout/${partido.id}`}>
                    {tarjeta}
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

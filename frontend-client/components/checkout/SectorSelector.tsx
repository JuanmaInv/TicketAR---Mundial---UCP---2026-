'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatPrice, getSectoresPorPartido, SectorPorPartido } from '@/lib/api';

interface SectorSelectorProps {
  partidoId: string;
  onComprar?: (sectorId: string, cantidad: number, total: number) => void;
  alContinuarCompra?: (sectorId: string, cantidad: number, total: number) => void;
}

export default function SectorSelector({
  partidoId,
  onComprar,
  alContinuarCompra,
}: SectorSelectorProps) {
  const [sectores, setSectores] = useState<SectorPorPartido[]>([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const inicio = setTimeout(() => {
      if (!activo) return;

      setCargando(true);
      setError('');

      getSectoresPorPartido(partidoId)
        .then((datos) => {
          if (!activo) return;

          const sectoresFiltrados = datos.filter((s) => {
            const nombre = s.nombre.toLowerCase();
            return (
              nombre.includes('popular') ||
              nombre.includes('palco') ||
              nombre.includes('vip') ||
              nombre.includes('platea')
            );
          });

          const primerDisponible = sectoresFiltrados.find((s) => s.asientosDisponibles > 0);

          setSectores(sectoresFiltrados);
          setSectorSeleccionado(primerDisponible ? primerDisponible.id : null);
          setCantidad(1);

          if (!primerDisponible) {
            setError('No quedan entradas disponibles para este partido.');
          }
        })
        .catch((errorCarga) => {
          if (!activo) return;

          setError(
            errorCarga instanceof Error
              ? errorCarga.message
              : 'No pudimos consultar la disponibilidad.',
          );
        })
        .finally(() => {
          if (activo) {
            setCargando(false);
          }
        });
    }, 0);

    return () => {
      activo = false;
      clearTimeout(inicio);
    };
  }, [partidoId]);

  const sectorActual = sectores.find((s) => s.id === sectorSeleccionado);
  const precioTotal = sectorActual ? sectorActual.precio * cantidad : 0;

  function obtenerColorSector(nombre: string): string {
    const nombreNormalizado = nombre.toLowerCase();
    if (nombreNormalizado.includes('palco')) return 'bg-purple-600 shadow-purple-900/40';
    if (nombreNormalizado.includes('vip') || nombreNormalizado.includes('platea')) return 'bg-blue-600 shadow-blue-900/40';
    if (nombreNormalizado.includes('popular')) return 'bg-amber-500 shadow-amber-900/40';
    return 'bg-zinc-600 shadow-black';
  }

  function continuarCompra() {
    if (!sectorActual) {
      setError('Elegi un sector disponible para continuar.');
      return;
    }

    if (sectorActual.asientosDisponibles <= 0) {
      setError(`No hay stock disponible en ${sectorActual.nombre}.`);
      return;
    }

    if (cantidad > sectorActual.asientosDisponibles) {
      setError(`Solo quedan ${sectorActual.asientosDisponibles} entradas en ${sectorActual.nombre}.`);
      return;
    }

    const callback = onComprar ?? alContinuarCompra;
    if (!callback) {
      setError('No se encontro el paso de confirmacion de compra.');
      return;
    }

    setError('');
    callback(sectorActual.idSector, cantidad, precioTotal);
  }

  if (cargando) {
    return (
      <div className="text-white text-center py-10 animate-pulse font-black uppercase tracking-widest text-xs">
        Cargando mapa oficial...
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
          {error}
        </div>
      )}

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-3/5 aspect-square rounded-2xl overflow-hidden border border-white/5 bg-black relative">
              <Image
                src="/stadium_3_sectors_2026_1777906767323.png"
                alt="Mapa del Estadio"
                width={900}
                height={900}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="w-full md:w-2/5 flex flex-col gap-4">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Selecciona tu ubicacion</h3>
              <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {sectores.map((sector) => {
                  const agotado = sector.asientosDisponibles <= 0;
                  return (
                    <button
                      key={sector.id}
                      type="button"
                      disabled={agotado}
                      onClick={() => {
                        if (!agotado) {
                          setSectorSeleccionado(sector.id);
                          setError('');
                          setCantidad(1);
                        }
                      }}
                      className={`relative rounded-2xl px-5 py-4 text-left transition-all duration-300 border ${
                        sectorSeleccionado === sector.id
                          ? 'border-white/40 scale-[1.02] shadow-2xl'
                          : 'border-white/5 opacity-60 hover:opacity-100'
                      } ${obtenerColorSector(sector.nombre)} ${agotado ? 'grayscale opacity-30 cursor-not-allowed' : 'hover:border-white/10'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="block text-[10px] font-black text-white/90 uppercase tracking-widest mb-1">{sector.nombre}</span>
                          <span className="block text-2xl font-black text-white tracking-tighter">{formatPrice(sector.precio)}</span>
                        </div>
                        {agotado ? (
                          <span className="bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Agotado</span>
                        ) : (
                          <span className="bg-white/20 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            {sector.asientosDisponibles} disp.
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-zinc-900/40 rounded-2xl p-6 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-zinc-500 font-black text-[10px] uppercase tracking-widest mb-2 block">Cantidad de Entradas</p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                aria-label="Restar entrada"
                onClick={() => {
                  setCantidad(Math.max(1, cantidad - 1));
                }}
                className="text-2xl font-bold text-white hover:text-blue-500 transition-colors"
              >
                -
              </button>
              <span className="text-4xl font-black text-white w-12 text-center">{cantidad}</span>
              <button
                type="button"
                aria-label="Sumar entrada"
                onClick={() => {
                  const stockSector = sectorActual?.asientosDisponibles ?? 0;
                  const maximo = Math.min(6, Math.max(0, stockSector));
                  setCantidad(Math.min(maximo > 0 ? maximo : 1, cantidad + 1));
                }}
                className="text-2xl font-bold text-white hover:text-emerald-500 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {sectorActual && (
          <div className="flex-1 bg-white p-6 rounded-2xl flex items-center justify-between shadow-2xl shadow-blue-500/10">
            <div>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Confirmado</p>
              <p className="text-4xl font-black text-black tracking-tighter italic">{formatPrice(precioTotal)}</p>
            </div>
            <button
              type="button"
              disabled={!sectorActual || sectorActual.asientosDisponibles <= 0}
              onClick={continuarCompra}
              className={`px-8 py-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all transform ${
                !sectorActual || sectorActual.asientosDisponibles <= 0
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/30'
              }`}
            >
              {!sectorActual || sectorActual.asientosDisponibles <= 0 ? 'AGOTADO' : 'REVISAR COMPRA ->'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getSectores, Sector, formatPrice } from '@/lib/api';

interface SectorSelectorProps {
  partidoId: string;
  onComprar: (sectorId: string, sectorNombre: string, cantidad: number, total: number) => void;
}

export default function SectorSelector({ onComprar }: Omit<SectorSelectorProps, 'partidoId'> & { partidoId: string }) {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getSectores()
      .then(datos => {
        // FILTRAR SOLO PALCO, PLATEA Y POPULAR (Ignorar Prensa y otros)
        const sectoresFiltrados = datos.filter(s => {
          const n = s.nombre.toLowerCase();
          return n.includes('palco') || n.includes('platea') || n.includes('popular');
        });
        
        setSectores(sectoresFiltrados);
        if (sectoresFiltrados.length > 0) setSectorSeleccionado(sectoresFiltrados[0].id);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error cargando sectores:', err);
        setCargando(false);
      });
  }, []);

  const sectorActual = sectores.find(s => s.id === sectorSeleccionado);
  const precioTotal = sectorActual ? sectorActual.precio * cantidad : 0;

  // Lógica de colores simplificada a los 3 sectores solicitados
  const getSectorColor = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('palco')) return 'bg-purple-600 shadow-purple-900/40'; // Púrpura/Magenta
    if (n.includes('platea')) return 'bg-blue-600 shadow-blue-900/40'; // Azul
    if (n.includes('popular')) return 'bg-amber-500 shadow-amber-900/40'; // Amarillo/Oro
    return 'bg-zinc-600 shadow-black';
  };

  const handleComprar = () => {
    if (!sectorSeleccionado || !sectorActual) {
      alert('Por favor selecciona un sector');
      return;
    }
    onComprar(sectorSeleccionado, sectorActual.nombre, cantidad, precioTotal);
  };

  if (cargando) {
    return <div className="text-white text-center py-10 animate-pulse font-black uppercase tracking-widest text-xs">Cargando mapa oficial...</div>;
  }

  return (
    <div className="w-full space-y-8">
      {/* Visualización del Estadio Simplificada */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Mapa del Estadio (3 Colores) */}
            <div className="w-full md:w-3/5 aspect-square rounded-2xl overflow-hidden border border-white/5 bg-black relative">
              <Image 
                src="/stadium_3_sectors_2026_1777906767323.png" 
                alt="Mapa del Estadio" 
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Selector de Sectores */}
            <div className="w-full md:w-2/5 flex flex-col gap-4">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Selecciona tu ubicación</h3>
              <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {sectores.map((sector) => {
                  const agotado = sector.capacidadDisponible <= 0;
                  return (
                    <button
                      key={sector.id}
                      disabled={agotado}
                      onClick={() => !agotado && setSectorSeleccionado(sector.id)}
                      className={`relative rounded-2xl px-5 py-4 text-left transition-all duration-300 border ${
                        sectorSeleccionado === sector.id 
                          ? 'border-white/40 scale-[1.02] shadow-2xl' 
                          : 'border-white/5 opacity-60 hover:opacity-100'
                      } ${getSectorColor(sector.nombre)} ${agotado ? 'grayscale opacity-30 cursor-not-allowed' : 'hover:border-white/10'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="block text-[10px] font-black text-white/90 uppercase tracking-widest mb-1">{sector.nombre}</span>
                          <span className="block text-2xl font-black text-white tracking-tighter">{formatPrice(sector.precio)}</span>
                        </div>
                        {agotado && (
                          <span className="bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Agotado</span>
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

      {/* Selector de Cantidad */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-zinc-900/40 rounded-2xl p-6 border border-white/5 flex items-center justify-between">
          <div>
            <label className="text-zinc-500 font-black text-[10px] uppercase tracking-widest mb-2 block">
              Cantidad de Entradas
            </label>
            <div className="flex items-center gap-6">
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="text-2xl font-bold text-white hover:text-blue-500 transition-colors">−</button>
              <span className="text-4xl font-black text-white w-12 text-center">{cantidad}</span>
              <button onClick={() => setCantidad(Math.min(6, cantidad + 1))} className="text-2xl font-bold text-white hover:text-emerald-500 transition-colors">+</button>
            </div>
          </div>
        </div>

        {/* Resumen Final y Botón de Compra */}
        {sectorActual && (
          <div className="flex-1 bg-white p-6 rounded-2xl flex items-center justify-between shadow-2xl shadow-blue-500/10">
            <div>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Confirmado</p>
              <p className="text-4xl font-black text-black tracking-tighter italic">{formatPrice(precioTotal)}</p>
            </div>
            <button
              disabled={sectorActual.capacidadDisponible <= 0}
              onClick={handleComprar}
              className={`relative group/buybtn overflow-hidden px-8 py-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all transform ${
                sectorActual.capacidadDisponible <= 0 
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/30'
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/buybtn:animate-shimmer"></span>
              {sectorActual.capacidadDisponible <= 0 ? 'AGOTADO' : 'COMPRAR AHORA →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface Sector {
  nombre: string;
  precio: number;
  color: string;
  capacidad: number;
}

interface SectorSelectorProps {
  partidoId: string;
  onComprar: (sector: string, cantidad: number, total: number) => void;
}

const SECTORES: Sector[] = [
  { nombre: 'Popular', precio: 150, color: 'bg-yellow-400', capacidad: 5000 },
  { nombre: 'General', precio: 350, color: 'bg-blue-500', capacidad: 3000 },
  { nombre: 'Palco', precio: 650, color: 'bg-purple-500', capacidad: 2000 },
  { nombre: 'VIP', precio: 1500, color: 'bg-red-600', capacidad: 1000 },
  { nombre: 'Suite', precio: 3000, color: 'bg-orange-600', capacidad: 500 },
];

export default function SectorSelector({ partidoId, onComprar }: SectorSelectorProps) {
  const [sectorSeleccionado, setSectorSeleccionado] = useState<string>('General');
  const [cantidad, setCantidad] = useState(1);

  const sectorActual = SECTORES.find(s => s.nombre === sectorSeleccionado);
  const precioTotal = sectorActual ? sectorActual.precio * cantidad : 0;

  const handleComprar = () => {
    if (!sectorSeleccionado) {
      alert('Por favor selecciona un sector');
      return;
    }
    onComprar(sectorSeleccionado, cantidad, precioTotal);
  };

  return (
    <div className="w-full space-y-8">
      {/* Info del Partido */}
      <div className="text-zinc-400 mb-4">
        <p className="text-sm">Partido ID: <span className="text-white font-bold">{partidoId}</span></p>
      </div>

      {/* Visualización del Estadio */}
      <div className="bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-3xl p-6 md:p-8 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_center,_rgba(45,212,191,0.08)_0%,_rgba(0,0,0,0)_45%),linear-gradient(180deg,#3f3f46_0%,#27272a_100%)]">
            <div className="absolute inset-4 rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_rgba(255,255,255,0)_55%)] shadow-inner" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[42%] w-[42%] min-w-[14rem] min-h-[14rem]">
                <div className="absolute inset-0 rounded-full bg-[#d9a441] opacity-80 blur-[1px]" />
                <div className="absolute inset-[9%] rounded-full bg-[#f0b85b] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.08)]" />
                <div className="absolute inset-[18%] rounded-full bg-[#e4a23d] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.08)]" />
                <div className="absolute inset-[28%] rounded-full bg-[#b86f1d] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.08)]" />
                <div className="absolute inset-[38%] rounded-full bg-[#2ea44f] border-[3px] border-white/90 shadow-[0_0_0_2px_rgba(0,0,0,0.15)] flex items-center justify-center">
                  <div className="absolute inset-4 rounded-full border border-white/80" />
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/80" />
                  <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80" />
                </div>
              </div>
            </div>

            <div className="absolute inset-0">
              <button
                onClick={() => setSectorSeleccionado('Popular')}
                className={`absolute left-[50%] top-[13%] -translate-x-1/2 rounded-2xl px-5 py-4 font-black text-white shadow-xl transition-transform ${SECTORES[0].color} ${sectorSeleccionado === 'Popular' ? 'ring-4 ring-white scale-105' : 'opacity-90 hover:scale-105'}`}
              >
                POPULAR
                <span className="block text-lg">${SECTORES[0].precio}</span>
              </button>

              <button
                onClick={() => setSectorSeleccionado('General')}
                className={`absolute left-[50%] top-[31%] -translate-x-1/2 rounded-2xl px-5 py-4 font-black text-white shadow-xl transition-transform ${SECTORES[1].color} ${sectorSeleccionado === 'General' ? 'ring-4 ring-white scale-105' : 'opacity-90 hover:scale-105'}`}
              >
                GENERAL
                <span className="block text-lg">${SECTORES[1].precio}</span>
              </button>

              <button
                onClick={() => setSectorSeleccionado('Palco')}
                className={`absolute right-[12%] top-[31%] rounded-2xl px-5 py-4 font-black text-white shadow-xl transition-transform ${SECTORES[2].color} ${sectorSeleccionado === 'Palco' ? 'ring-4 ring-white scale-105' : 'opacity-90 hover:scale-105'}`}
              >
                PALCO
                <span className="block text-lg">${SECTORES[2].precio}</span>
              </button>

              <button
                onClick={() => setSectorSeleccionado('VIP')}
                className={`absolute left-[18%] bottom-[21%] rounded-2xl px-5 py-4 font-black text-white shadow-xl transition-transform ${SECTORES[3].color} ${sectorSeleccionado === 'VIP' ? 'ring-4 ring-white scale-105' : 'opacity-90 hover:scale-105'}`}
              >
                VIP
                <span className="block text-lg">${SECTORES[3].precio}</span>
              </button>

              <button
                onClick={() => setSectorSeleccionado('Suite')}
                className={`absolute left-[50%] bottom-[18%] -translate-x-1/2 rounded-2xl px-5 py-4 font-black text-white shadow-xl transition-transform ${SECTORES[4].color} ${sectorSeleccionado === 'Suite' ? 'ring-4 ring-white scale-105' : 'opacity-90 hover:scale-105'}`}
              >
                SUITE
                <span className="block text-lg">${SECTORES[4].precio}</span>
              </button>
            </div>

            <div className="absolute left-[14%] top-[49%] text-xs font-black uppercase tracking-[0.3em] text-white/45">
              Campo
            </div>
            <div className="absolute right-[14%] top-[49%] text-xs font-black uppercase tracking-[0.3em] text-white/45">
              Campo
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-[11px] text-cyan-200/80">
              Haz clic en un sector para seleccionarlo
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Cantidad */}
      <div className="bg-zinc-800/40 rounded-xl p-6 border border-zinc-700">
        <label className="text-white font-bold text-lg mb-4 block">
          Cantidad de Entradas
        </label>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-bold text-xl transition-colors"
          >
            −
          </button>
          <div className="text-5xl font-black text-white min-w-20 text-center bg-zinc-900 py-2 px-6 rounded-lg">
            {cantidad}
          </div>
          <button
            onClick={() => setCantidad(Math.min(6, cantidad + 1))}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-bold text-xl transition-colors"
          >
            +
          </button>
        </div>
        <p className="text-zinc-400 text-sm mt-3">Máximo 6 entradas por compra</p>
      </div>

      {/* Resumen de Precio */}
      {sectorActual && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-blue-100 text-sm uppercase tracking-wide font-semibold">
                Sector: {sectorSeleccionado}
              </p>
              <p className="text-blue-100 text-sm mt-1">
                ${sectorActual.precio} × {cantidad} entrada{cantidad > 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm mb-1 uppercase tracking-wide font-semibold">
                Total
              </p>
              <p className="text-5xl font-black text-white">
                ${precioTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón Comprar */}
      <button
        onClick={handleComprar}
        className="w-full py-5 rounded-xl font-bold text-xl transition-all transform bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-105 shadow-lg active:scale-95"
      >
        Comprar {cantidad} Entrada{cantidad > 1 ? 's' : ''} → ${precioTotal.toLocaleString()}
      </button>
    </div>
  );
}

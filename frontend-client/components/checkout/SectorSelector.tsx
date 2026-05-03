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
  { nombre: 'Popular', precio: 15, color: 'bg-yellow-400', capacidad: 5000 },
  { nombre: 'General', precio: 35, color: 'bg-blue-500', capacidad: 3000 },
  { nombre: 'VIP', precio: 75, color: 'bg-red-600', capacidad: 1000 },
  { nombre: 'Prensa', precio: 45, color: 'bg-green-500', capacidad: 2000 },
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
      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(27,27,31,0.98),rgba(14,14,16,0.98))] p-4 md:p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div
          className="relative mx-auto aspect-[16/12] w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/stadiums/metlife.png")' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.26)_58%,rgba(0,0,0,0.48)_100%)]" />
          <div className="absolute inset-3 rounded-[1.5rem] border border-white/12 shadow-inner" />

          <button
            onClick={() => setSectorSeleccionado('Popular')}
            className={`absolute left-1/2 top-[6%] z-10 -translate-x-1/2 rounded-[1.2rem] px-6 py-4 text-center font-black text-white shadow-[0_18px_35px_rgba(0,0,0,0.32)] transition-all ${SECTORES[0].color} ${sectorSeleccionado === 'Popular' ? 'scale-105 ring-4 ring-white/90' : 'opacity-95 hover:-translate-y-1 hover:scale-[1.03]'}`}
          >
            <span className="block text-sm tracking-wide">POPULAR</span>
            <span className="block text-lg">${SECTORES[0].precio}</span>
          </button>

          <button
            onClick={() => setSectorSeleccionado('General')}
            className={`absolute left-[10%] top-[40%] z-10 rounded-[1.2rem] px-6 py-4 text-center font-black text-white shadow-[0_18px_35px_rgba(0,0,0,0.32)] transition-all ${SECTORES[1].color} ${sectorSeleccionado === 'General' ? 'scale-105 ring-4 ring-white/90' : 'opacity-95 hover:-translate-y-1 hover:scale-[1.03]'}`}
          >
            <span className="block text-sm tracking-wide">GENERAL</span>
            <span className="block text-lg">${SECTORES[1].precio}</span>
          </button>

          <button
            onClick={() => setSectorSeleccionado('Prensa')}
            className={`absolute right-[10%] top-[40%] z-10 rounded-[1.2rem] px-6 py-4 text-center font-black text-white shadow-[0_18px_35px_rgba(0,0,0,0.32)] transition-all ${SECTORES[3].color} ${sectorSeleccionado === 'Prensa' ? 'scale-105 ring-4 ring-white/90' : 'opacity-95 hover:-translate-y-1 hover:scale-[1.03]'}`}
          >
            <span className="block text-sm tracking-wide">PRENSA</span>
            <span className="block text-lg">${SECTORES[3].precio}</span>
          </button>

          <button
            onClick={() => setSectorSeleccionado('VIP')}
            className={`absolute left-[12%] bottom-[15%] z-10 rounded-[1.2rem] px-6 py-4 text-center font-black text-white shadow-[0_18px_35px_rgba(0,0,0,0.32)] transition-all ${SECTORES[2].color} ${sectorSeleccionado === 'VIP' ? 'scale-105 ring-4 ring-white/90' : 'opacity-95 hover:-translate-y-1 hover:scale-[1.03]'}`}
          >
            <span className="block text-sm tracking-wide">VIP</span>
            <span className="block text-lg">${SECTORES[2].precio}</span>
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-[11px] text-cyan-100/75">
            Haz clic en un sector para seleccionarlo
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

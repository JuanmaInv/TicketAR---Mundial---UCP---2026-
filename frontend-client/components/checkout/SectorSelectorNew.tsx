'use client';

import { useState } from 'react';

interface Sector {
  nombre: string;
  precio: number;
  color: string;
  capacidad: number;
}

interface SectorSelectorProps {
  alContinuarCompra: (sector: string, cantidad: number, total: number) => void;
}

const SECTORES: Sector[] = [
  { nombre: 'Popular', precio: 15, color: 'bg-yellow-400', capacidad: 5000 },
  { nombre: 'General', precio: 35, color: 'bg-blue-500', capacidad: 3000 },
  { nombre: 'VIP', precio: 75, color: 'bg-red-600', capacidad: 1000 },
  { nombre: 'Prensa', precio: 45, color: 'bg-green-500', capacidad: 2000 },
];

export default function SectorSelector({ alContinuarCompra }: SectorSelectorProps) {
  const [sectorSeleccionado, setSectorSeleccionado] = useState<string>('General');
  const [cantidad, setCantidad] = useState(1);
  const [mensajeError, setMensajeError] = useState('');

  const sectorActual = SECTORES.find(s => s.nombre === sectorSeleccionado);
  const precioTotal = sectorActual ? sectorActual.precio * cantidad : 0;

  function continuarCompra() {
    if (!sectorSeleccionado) {
      setMensajeError('Por favor seleccioná un sector.');
      return;
    }
    setMensajeError('');
    alContinuarCompra(sectorSeleccionado, cantidad, precioTotal);
  }

  return (
    <div className="w-full space-y-8">
      {mensajeError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-500">
          {mensajeError}
        </div>
      )}
      {/* Mapa Visual del Estadio */}
      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(27,27,31,0.98),rgba(14,14,16,0.98))] p-4 md:p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Imagen del Estadio */}
          <div
            className="relative w-full md:w-2/3 aspect-[16/12] md:aspect-auto rounded-[1.75rem] border border-white/10 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url("/images/stadiums/metlife.png")' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.26)_58%,rgba(0,0,0,0.48)_100%)] rounded-[1.75rem]" />
            <div className="absolute inset-3 rounded-[1.5rem] border border-white/12 shadow-inner" />
          </div>

          {/* Botones de Sectores a un lado */}
          <div className="w-full md:w-1/3 flex flex-col justify-center gap-4">
            <button type="button" onClick={() => setSectorSeleccionado('Popular')} className={`rounded-[1.2rem] px-6 py-4 text-center font-black text-white shadow-[0_18px_35px_rgba(0,0,0,0.32)] transition-all ${SECTORES[0].color} ${sectorSeleccionado === 'Popular' ? 'scale-105 ring-4 ring-white/90' : 'opacity-95 hover:-translate-y-1 hover:scale-[1.03]'}`}>
              <span className="block text-sm tracking-wide">POPULAR</span>
              <span className="block text-lg">${SECTORES[0].precio}</span>
            </button>

            <button type="button" onClick={() => setSectorSeleccionado('General')} className={`rounded-[1.2rem] px-6 py-4 text-center font-black text-white shadow-[0_18px_35px_rgba(0,0,0,0.32)] transition-all ${SECTORES[1].color} ${sectorSeleccionado === 'General' ? 'scale-105 ring-4 ring-white/90' : 'opacity-95 hover:-translate-y-1 hover:scale-[1.03]'}`}>
              <span className="block text-sm tracking-wide">GENERAL</span>
              <span className="block text-lg">${SECTORES[1].precio}</span>
            </button>

            <button type="button" onClick={() => setSectorSeleccionado('Prensa')} className={`rounded-[1.2rem] px-6 py-4 text-center font-black text-white shadow-[0_18px_35px_rgba(0,0,0,0.32)] transition-all ${SECTORES[3].color} ${sectorSeleccionado === 'Prensa' ? 'scale-105 ring-4 ring-white/90' : 'opacity-95 hover:-translate-y-1 hover:scale-[1.03]'}`}>
              <span className="block text-sm tracking-wide">PRENSA</span>
              <span className="block text-lg">${SECTORES[3].precio}</span>
            </button>

            <button type="button" onClick={() => setSectorSeleccionado('VIP')} className={`rounded-[1.2rem] px-6 py-4 text-center font-black text-white shadow-[0_18px_35px_rgba(0,0,0,0.32)] transition-all ${SECTORES[2].color} ${sectorSeleccionado === 'VIP' ? 'scale-105 ring-4 ring-white/90' : 'opacity-95 hover:-translate-y-1 hover:scale-[1.03]'}`}>
              <span className="block text-sm tracking-wide">VIP</span>
              <span className="block text-lg">${SECTORES[2].precio}</span>
            </button>

            <p className="text-center text-[11px] text-cyan-100/75 mt-2">
              Haz clic en un sector para seleccionarlo
            </p>
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
            type="button"
            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            className="bg-gradient-to-br from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white px-6 py-3 rounded-lg font-bold text-xl transition-all duration-200 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 border border-slate-500/30 hover:border-blue-400/60"
          >
            −
          </button>
          <div className="text-5xl font-black text-white min-w-20 text-center bg-gradient-to-b from-slate-800 to-slate-900 py-2 px-6 rounded-lg border border-slate-600/50 shadow-inner">
            {cantidad}
          </div>
          <button
            type="button"
            onClick={() => setCantidad(Math.min(6, cantidad + 1))}
            className="bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-bold text-xl transition-all duration-200 transform hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/40 active:scale-95 border border-emerald-500/30 hover:border-emerald-300/60"
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
        type="button"
        onClick={continuarCompra}
        className="w-full py-5 rounded-xl font-bold text-xl transition-all transform bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-105 shadow-lg active:scale-95"
      >
        Comprar {cantidad} Entrada{cantidad > 1 ? 's' : ''} → ${precioTotal.toLocaleString()}
      </button>
    </div>
  );
}

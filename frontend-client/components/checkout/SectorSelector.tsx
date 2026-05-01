'use client';

import { useState } from 'react';

interface Sector {
  nombre: string;
  precio: number;
  color: string;
  capacidad: number;
}

interface SectorSelectorProps {
  onComprar: (sector: string, cantidad: number, total: number) => void;
}

const SECTORES: Sector[] = [
  { nombre: 'Popular', precio: 150, color: 'bg-yellow-400', capacidad: 5000 },
  { nombre: 'General', precio: 350, color: 'bg-blue-500', capacidad: 3000 },
  { nombre: 'Palco', precio: 650, color: 'bg-purple-500', capacidad: 2000 },
  { nombre: 'VIP', precio: 1500, color: 'bg-red-600', capacidad: 1000 },
  { nombre: 'Suite', precio: 3000, color: 'bg-orange-600', capacidad: 500 },
];

export default function SectorSelector({ onComprar }: SectorSelectorProps) {
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
      {/* Mapa Visual del Estadio */}
      <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-green-600 rounded-lg px-12 py-6">
            <p className="text-white font-bold text-2xl">⚽ CANCHA ⚽</p>
          </div>
        </div>

        {/* Grid de Sectores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {SECTORES.map(sector => (
            <button
              key={sector.nombre}
              onClick={() => setSectorSeleccionado(sector.nombre)}
              className={`
                relative p-6 rounded-xl transition-all transform cursor-pointer
                ${sectorSeleccionado === sector.nombre 
                  ? 'ring-4 ring-offset-2 ring-blue-400 shadow-xl scale-105 dark:ring-offset-slate-900' 
                  : 'opacity-70 hover:opacity-90 hover:scale-102'
                }
                ${sector.color}
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="font-bold text-white text-sm uppercase tracking-wide">
                  {sector.nombre}
                </span>
                <span className="text-white font-bold text-lg">
                  ${sector.precio}
                </span>
                <span className="text-white text-xs opacity-90">
                  {sector.capacidad} lugares
                </span>
              </div>
              
              {sectorSeleccionado === sector.nombre && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
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

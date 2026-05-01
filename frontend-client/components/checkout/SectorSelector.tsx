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

      {/* Visualización Realista del Estadio */}
      <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-8">
        <div className="max-w-3xl mx-auto">
          {/* MAPA DEL ESTADIO - LAYOUT CIRCULAR */}
          <div className="relative w-full bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-3xl p-6 mb-6">
            {/* CAMPO EN CENTRO */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-600 rounded-xl px-16 py-8 text-center">
                <p className="text-white font-bold text-2xl">⚽ CANCHA ⚽</p>
              </div>
            </div>

            {/* GRID DEL ESTADIO - 3x3 layout */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* ESQUINA ARRIBA IZQ */}
              <div className="flex justify-center">
                <button
                  onClick={() => setSectorSeleccionado('Popular')}
                  className={`${SECTORES[0].color} p-4 rounded-lg font-bold text-white text-center cursor-pointer transition-all transform
                    ${sectorSeleccionado === 'Popular' 
                      ? 'ring-4 ring-blue-400 shadow-lg scale-110' 
                      : 'opacity-75 hover:opacity-100'
                    }`}
                >
                  <div>POPULAR</div>
                  <div className="text-sm">${SECTORES[0].precio}</div>
                </button>
              </div>

              {/* ARRIBA CENTRO */}
              <div className="flex justify-center">
                <button
                  onClick={() => setSectorSeleccionado('General')}
                  className={`${SECTORES[1].color} p-4 rounded-lg font-bold text-white text-center cursor-pointer transition-all transform
                    ${sectorSeleccionado === 'General' 
                      ? 'ring-4 ring-blue-400 shadow-lg scale-110' 
                      : 'opacity-75 hover:opacity-100'
                    }`}
                >
                  <div>GENERAL</div>
                  <div className="text-sm">${SECTORES[1].precio}</div>
                </button>
              </div>

              {/* ESQUINA ARRIBA DER */}
              <div className="flex justify-center">
                <button
                  onClick={() => setSectorSeleccionado('Palco')}
                  className={`${SECTORES[2].color} p-4 rounded-lg font-bold text-white text-center cursor-pointer transition-all transform
                    ${sectorSeleccionado === 'Palco' 
                      ? 'ring-4 ring-blue-400 shadow-lg scale-110' 
                      : 'opacity-75 hover:opacity-100'
                    }`}
                >
                  <div>PALCO</div>
                  <div className="text-sm">${SECTORES[2].precio}</div>
                </button>
              </div>

              {/* IZQUIERDA CENTRO */}
              <div className="flex justify-center items-center">
                <div className="text-white text-xs font-bold opacity-50">CAMPO</div>
              </div>

              {/* CENTRO - ESTADIO */}
              <div className="flex justify-center items-center">
                <div className="w-20 h-20 bg-green-700 rounded-xl border-4 border-white flex items-center justify-center">
                  <span className="text-white font-bold text-xs text-center">CANCHA</span>
                </div>
              </div>

              {/* DERECHA CENTRO */}
              <div className="flex justify-center items-center">
                <div className="text-white text-xs font-bold opacity-50">CAMPO</div>
              </div>

              {/* ESQUINA ABAJO IZQ */}
              <div className="flex justify-center">
                <button
                  onClick={() => setSectorSeleccionado('VIP')}
                  className={`${SECTORES[3].color} p-4 rounded-lg font-bold text-white text-center cursor-pointer transition-all transform
                    ${sectorSeleccionado === 'VIP' 
                      ? 'ring-4 ring-blue-400 shadow-lg scale-110' 
                      : 'opacity-75 hover:opacity-100'
                    }`}
                >
                  <div>VIP</div>
                  <div className="text-sm">${SECTORES[3].precio}</div>
                </button>
              </div>

              {/* ABAJO CENTRO */}
              <div className="flex justify-center">
                <button
                  onClick={() => setSectorSeleccionado('Suite')}
                  className={`${SECTORES[4].color} p-4 rounded-lg font-bold text-white text-center cursor-pointer transition-all transform
                    ${sectorSeleccionado === 'Suite' 
                      ? 'ring-4 ring-blue-400 shadow-lg scale-110' 
                      : 'opacity-75 hover:opacity-100'
                    }`}
                >
                  <div>SUITE</div>
                  <div className="text-sm">${SECTORES[4].precio}</div>
                </button>
              </div>

              {/* ESQUINA ABAJO DER */}
              <div className="flex justify-center">
                <div className="text-white text-xs font-bold opacity-50">---</div>
              </div>
            </div>

            {/* LEYENDA */}
            <div className="text-center text-xs text-zinc-400">
              Haz clic en un sector para seleccionarlo (aparecerá destacado)
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

'use client';

import { DatosCompra } from '@/types/ticket';

interface ResumenProps {
  partidoId: string;
  datos: DatosCompra;
  onVolver: () => void;
  onConfirmar: () => void;
}

export default function ResumenCompra({ partidoId, datos, onVolver, onConfirmar }: ResumenProps) {
  // Simulamos un precio estático para simular la compra (luego se conectará a la Base de Datos)
  const PRECIO_UNITARIO = 50000;
  const total = PRECIO_UNITARIO * datos.cantidad;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-zinc-200">
      <h2 className="text-2xl font-bold text-zinc-800 mb-6 border-b pb-2">Resumen de tu Compra</h2>
      
      <div className="space-y-4 mb-8">
        {/* Sección 1: Qué está comprando */}
        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
          <h3 className="font-semibold text-zinc-700 mb-2">Detalles del Evento</h3>
          <p className="text-zinc-600">ID del Partido: <span className="font-bold text-blue-600">{partidoId}</span></p>
        </div>

        {/* Sección 2: Quién lo está comprando */}
        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
          <h3 className="font-semibold text-zinc-700 mb-2">Tus Datos</h3>
          <ul className="text-zinc-600 text-sm space-y-1">
            <li><strong>Nombre completo:</strong> {datos.nombre} {datos.apellido}</li>
            <li><strong>DNI:</strong> {datos.documento}</li>
            <li><strong>Email:</strong> {datos.email}</li>
            <li><strong>Ubicación:</strong> {datos.localidad}, {datos.provincia}</li>
          </ul>
        </div>

        {/* Sección 3: Cuánto va a pagar */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-2">Detalle del Pago</h3>
          <div className="flex justify-between items-center text-blue-900">
            <span>{datos.cantidad} x Entradas (${PRECIO_UNITARIO.toLocaleString('es-AR')} c/u)</span>
            <span className="text-xl font-bold">${total.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>

      {/* Botonera de Acción */}
      <div className="flex gap-4">
        <button 
          onClick={onVolver}
          className="w-1/3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold py-4 rounded-xl transition-all"
        >
          Modificar Datos
        </button>
        <button 
          onClick={onConfirmar}
          className="w-2/3 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(22,163,74,0.5)]"
        >
          Confirmar y Pagar
        </button>
      </div>
    </div>
  );
}

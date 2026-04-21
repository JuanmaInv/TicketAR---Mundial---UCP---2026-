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
      </div>
    </div>
  );
}

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
    <div className="bg-white p-8 rounded-xl shadow-lg border border-zinc-200 text-center">
      <h2 className="text-xl font-bold mb-4">Resumen de la Compra</h2>
      <p className="text-zinc-500 italic">...El diseño del resumen se agregará en el próximo commit...</p>
    </div>
  );
}

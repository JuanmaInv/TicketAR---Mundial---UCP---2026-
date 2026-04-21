'use client';

import { useState } from 'react';
import { DatosCompra } from '@/types/ticket';

export default function BuyerForm({ partidoId }: { partidoId: string }) {
  // =========================================================================
  // DEFINICIÓN DE CAMPOS DEL FORMULARIO DE COMPRAS (ESTADO)
  // =========================================================================
  // Aquí guardamos temporalmente lo que el usuario va tipeando.
  // Cumple con la interfaz DatosCompra definida en types/ticket.ts
  const [formData, setFormData] = useState<DatosCompra>({
    partidoId: partidoId, // ID del producto/partido a comprar
    cantidad: 1,          // Selector de 1 a 6 (Por defecto 1)
    nombre: '',           // Nombre del comprador
    apellido: '',         // Apellido del comprador
    documento: '',        // DNI o equivalente
    email: '',            // Correo electrónico para enviar el ticket
    telefono: '',         // Teléfono de contacto
    provincia: '',        // Seleccionado de un combo
    localidad: '',        // Localidad
  });

  // =========================================================================
  // LISTADO DE PROVINCIAS PARA EL COMBO BOX (Requerimiento Paso 2)
  // =========================================================================
  const provincias = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 
    'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  return (
    <div>
      {/* El HTML de los inputs se construirá en el siguiente commit */}
      <p className="text-zinc-500 text-sm italic">Cargando campos del formulario...</p>
    </div>
  );
}

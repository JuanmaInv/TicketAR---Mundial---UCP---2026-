'use client';

import { useState } from 'react';
import { DatosCompra } from '@/types/ticket';

export default function BuyerForm({ partidoId }: { partidoId: string }) {
  // DEFINICIÓN DE CAMPOS DEL FORMULARIO DE COMPRAS (ESTADO)
  // Cumple con la interfaz DatosCompra definida en types/ticket.ts
  const [formData, setFormData] = useState<DatosCompra>({ //definimos el estado inicial del formulario con valores por defecto
    partidoId: partidoId, // ID del partido a comprar
    cantidad: 1,          // Selector de 1 a 6 (Por defecto 1)
    nombre: '',           // Nombre del comprador
    apellido: '',         // Apellido del comprador
    documento: '',        // DNI o equivalente
    email: '',            // Correo electronico para enviar el ticket
    telefono: '',         // Telefono de contacto
    provincia: '',        // Seleccionado de un combo
    localidad: '',        // Localidad
  });

  // LISTADO DE PROVINCIAS(Requerimiento Paso 2)
  const provincias = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos',
    'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  // =========================================================================
  // LOGICA DE ACTUALIZACION DEL ESTADO
  // =========================================================================
  // Esta funcion se llamara cada vez que el usuario escriba algo en cualquier campo.
  // Toma el atributo 'name' del input y actualiza la propiedad correspondiente en formData.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // Validacion: si el campo es 'cantidad', lo forzamos a ser un número.
      [name]: name === 'cantidad' ? parseInt(value) || 1 : value
    }));
  };

  return ( //aca debe ir todo el codigo del form donde usaremos los .map para generar los inputs y el select.
    <div
      className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-zinc-200"
    >
      <h2 className="text-2xl font-bold text-zinc-800 mb-2">Datos del Comprador</h2>
      <p className="text-zinc-500 mb-6">Informacion de contacto del comprador.</p>

      {/*  
        Los inputs reales seran agregados en el siguiente commit,
        estos dispararan la funcion handleInputChange.
      */}
      <form className="space-y-4">
        {/*CAMPOS DE DATOS (Parte 1 del Formulario) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre</label>
            <input
              type="text" name="nombre" value={formData.nombre} onChange={handleInputChange}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Apellido</label>
            <input
              type="text" name="apellido" value={formData.apellido} onChange={handleInputChange}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Documento (DNI)</label>
            <input
              type="text" name="documento" value={formData.documento} onChange={handleInputChange}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input
              type="email" name="email" value={formData.email} onChange={handleInputChange}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Teléfono</label>
            <input
              type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Aquí agregaremos cantidad, provincia y localidad */}
        <p className="text-sm text-blue-500 italic mt-4 text-center">...la cantidad y ubicación se insertarán en el próximo paso...</p>
      </form>
    </div>
  );
}

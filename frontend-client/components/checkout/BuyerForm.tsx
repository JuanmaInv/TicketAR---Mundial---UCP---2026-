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
  // LÓGICA DE ACTUALIZACIÓN DEL ESTADO
  // =========================================================================
  // Esta función se llamará cada vez que el usuario escriba algo en cualquier campo.
  // Toma el atributo 'name' del input y actualiza la propiedad correspondiente en formData.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // Validación en caliente: si el campo es 'cantidad', lo forzamos a ser un número.
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
        Envolvemos todo en la etiqueta genérica <form>. 
        En el siguiente commit agregaremos los inputs reales (DNI, Provincia, etc)
        que dispararán la función handleInputChange.
      */}
      <form className="space-y-4">
        <p className="text-sm text-blue-500 italic">...los campos del formulario se insertarán aquí...</p>
      </form>
    </div>
  );
}

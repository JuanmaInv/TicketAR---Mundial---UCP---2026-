'use client';

import { useState } from 'react';
import { DatosCompra } from '@/types/ticket';

export default function BuyerForm({ partidoId, onValidacionExitosa }: { partidoId: string, onValidacionExitosa: (datos: DatosCompra) => void }) {
  // DEFINICIÓN DE CAMPOS DEL FORMULARIO DE COMPRAS (ESTADO)
  // Cumple con la interfaz DatosCompra definida en types/ticket.ts
  const [datosCompra, setDatosCompra] = useState<DatosCompra>({ //definimos el estado inicial del formulario con valores por defecto
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

  const [errores, setErrores] = useState<Record<string, string>>({}); //estado de errores, string en blanco si no hay error, texto rojo si hay error.

  // LISTADO DE PROVINCIAS(Requerimiento Paso 2)
  const provincias = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos',
    'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  // =========================================================================
  // LOGICA DE VALIDACION Y ACTUALIZACION DEL ESTADO
  // =========================================================================

  // Función para validar un solo campo y retornar su mensaje de error (si lo tiene)
  const validarCampo = (nombreCampo: string, valor: string | number) => {
    let error = '';
    const valorStr = valor.toString().trim();

    // Validacion comun para campos vacios
    if (!valorStr && nombreCampo !== 'cantidad') {
      return '* Este campo es obligatorio.';
    }

    if (nombreCampo === 'cantidad') {
      const cant = typeof valor === 'number' ? valor : parseInt(valor as string) || 0;
      if (cant < 1 || cant > 6) {
        error = '* La cantidad debe ser entre 1 y 6 entradas.';
      }
    } else if (nombreCampo === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorStr)) {
        error = '* Por favor ingresa un email válido.';
      }
    } else if (nombreCampo === 'nombre' || nombreCampo === 'apellido') {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valorStr)) {
        error = '* Solo se permiten letras y espacios.';
      } else if (valorStr.length < 2) {
        error = '* Debe tener al menos 2 caracteres.';
      }
    } else if (nombreCampo === 'documento') {
      if (!/^\d{7,8}$/.test(valorStr)) {
        error = '* El DNI debe tener 7 u 8 números (sin puntos).';
      }
    } else if (nombreCampo === 'telefono') {
      if (!/^\d{8,15}$/.test(valorStr)) {
        error = '* Debe contener solo números (mínimo 8 dígitos).';
      }
    }

    return error;
  };

  // Esta funcion se llamara cada vez que el usuario escriba algo en cualquier campo.
  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Si borramos la cantidad, guardamos un 0 temporalmente para que no de error de tipado y se vea lo que escribe
    const nuevoValor = name === 'cantidad' ? (value === '' ? 0 : parseInt(value)) : value;

    setDatosCompra(previo => ({
      ...previo,
      [name]: nuevoValor
    }));

    // Validación en tiempo real: actualiza el error mientras el usuario escribe
    const errorDelCampo = validarCampo(name, nuevoValor);
    setErrores(previo => ({
      ...previo,
      [name]: errorDelCampo
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    // Validamos todos los campos de golpe antes de enviar
    Object.keys(datosCompra).forEach(key => {
      if (key !== 'partidoId') { // No validamos el ID del partido porque viene por props
        const errorMsg = validarCampo(key, datosCompra[key as keyof DatosCompra]);
        if (errorMsg) nuevosErrores[key] = errorMsg;
      }
    });

    setErrores(nuevosErrores);
    // Retorna true si no hay errores
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarFormulario()) {
      // Avanzamos al Paso 3 enviando los datos del formulario
      onValidacionExitosa(datosCompra);
    }
  };

  // Función auxiliar para tener bordes rojos cuando hay error
  const getInputClass = (nombreCampo: string) => {
    return `w-full border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-all text-zinc-900 ${errores[nombreCampo]
      ? 'border-red-500 focus:ring-red-500 bg-red-50'
      : 'border-zinc-300 focus:ring-blue-500 bg-white'
      }`;
  };

  return ( //aca debe ir todo el codigo del form donde usaremos los .map para generar los inputs y el select.
    <div
      className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-zinc-200"
    >
      <h2 className="text-2xl font-bold text-zinc-800 mb-2">Datos del Comprador</h2>
      <p className="text-zinc-500 mb-6">Informacion de contacto del comprador.</p>

      {/*  
        Los inputs reales seran agregados en el siguiente commit,
        estos dispararan la funcion manejarCambioInput.
      */}
      <form className="space-y-4" onSubmit={manejarEnvio}>
        {/*CAMPOS DE DATOS (Parte 1 del Formulario) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre</label>
            <input
              type="text" name="nombre" value={datosCompra.nombre} onChange={manejarCambioInput}
              className={getInputClass('nombre')}
            />
            {errores.nombre && <p className="text-red-500 text-xs mt-1 font-medium">{errores.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Apellido</label>
            <input
              type="text" name="apellido" value={datosCompra.apellido} onChange={manejarCambioInput}
              className={getInputClass('apellido')}
            />
            {errores.apellido && <p className="text-red-500 text-xs mt-1 font-medium">{errores.apellido}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Documento (DNI)</label>
            <input
              type="text" name="documento" value={datosCompra.documento} onChange={manejarCambioInput}
              className={getInputClass('documento')}
            />
            {errores.documento && <p className="text-red-500 text-xs mt-1 font-medium">{errores.documento}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input
              type="email" name="email" value={datosCompra.email} onChange={manejarCambioInput}
              className={getInputClass('email')}
            />
            {errores.email && <p className="text-red-500 text-xs mt-1 font-medium">{errores.email}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Teléfono</label>
            <input
              type="tel" name="telefono" value={datosCompra.telefono} onChange={manejarCambioInput}
              className={getInputClass('telefono')}
            />
            {errores.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{errores.telefono}</p>}
          </div>
        </div>

        {/* CAMPOS DE UBICACION Y CANTIDAD (Parte 2 del Formulario) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-200">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Provincia</label>
            <select
              name="provincia" value={datosCompra.provincia} onChange={manejarCambioInput}
              className={getInputClass('provincia')}
            >
              <option value="">Selecciona tu provincia</option>
              {provincias.map(provincia => ( //aca esta el listado de provincias
                <option key={provincia} value={provincia}>{provincia}</option>
              ))}
            </select>
            {errores.provincia && <p className="text-red-500 text-xs mt-1 font-medium">{errores.provincia}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Localidad</label>
            <input
              type="text" name="localidad" value={datosCompra.localidad} onChange={manejarCambioInput}
              className={getInputClass('localidad')}
            />
            {/* aca va la seleccion de localidades que saldran al seleccionar una provincia. */}
            {errores.localidad && <p className="text-red-500 text-xs mt-1 font-medium">{errores.localidad}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Cantidad de entradas (Máx. 6)</label>
            <input
              type="number" name="cantidad" min="1" max="6"
              onChange={manejarCambioInput}
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('El valor debe ser mayor o igual a 1')}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
              className={getInputClass('cantidad')}
            />
            {/* ACA VA LA CANTIDAD DE ENTRADAS QUE SE PUEDEN COMPRAR(MAX 6). */}
            {errores.cantidad && <p className="text-red-500 text-xs mt-1 font-medium">{errores.cantidad}</p>}
          </div>
        </div>

        {/* BOTÓN DE ENVÍO */}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-8 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          Validar Datos y Continuar
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { DatosCompra } from '@/types/ticket';

export default function BuyerForm({ partidoId }: { partidoId: string }) {
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
  const [cargando, setCargando] = useState(false); //estado de carga. si es true, se muestra un spinner y se deshabilita el boton.
  const [mensaje, setMensaje] = useState(''); //estado de mensajes, string en blanco si no hay mensaje, texto rojo si hay mensaje.

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
  // Toma el atributo 'name' del input y actualiza la propiedad correspondiente en datosCompra.
  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target; // name y value son palabras reservadas del objeto e.target de React
    setDatosCompra(estadoPrevio => ({
      ...estadoPrevio,
      // Validacion: si el campo es 'cantidad', lo forzamos a ser un número.
      [name]: name === 'cantidad' ? parseInt(value) || 1 : value
    }));
    // Limpiamos el error del campo si el usuario empieza a escribir
    if (errores[name]) {
      setErrores(estadoPrevio => ({ ...estadoPrevio, [name]: '' }));
    }
  };

  // =========================================================================
  // LOGICA DE VALIDACION Y ENVIO
  // =========================================================================
  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    if (!datosCompra.nombre.trim()) nuevosErrores.nombre = 'Obligatorio.';
    if (!datosCompra.apellido.trim()) nuevosErrores.apellido = 'Obligatorio.';
    if (!datosCompra.documento.trim()) nuevosErrores.documento = 'Obligatorio.';
    if (!datosCompra.email.trim()) nuevosErrores.email = 'Obligatorio.';
    if (!datosCompra.telefono.trim()) nuevosErrores.telefono = 'Obligatorio.';
    if (!datosCompra.provincia) nuevosErrores.provincia = 'Obligatorio.';
    if (!datosCompra.localidad.trim()) nuevosErrores.localidad = 'Obligatorio.';
    if (datosCompra.cantidad < 1 || datosCompra.cantidad > 6) nuevosErrores.cantidad = 'De 1 a 6.';

    setErrores(nuevosErrores);
    // Retorna true si no hay errores
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault(); // prevenimos la recarga de la pagina (comportamiento por defecto del form)
    if (validarFormulario()) {
      setCargando(true);
      setMensaje('');
      
      // NOTA: Aquí el front se conectará a la API real del backend (NestJS) 
      // que a su vez hará la integración real con la plataforma de pagos.
      alert('Validacion exitosa. Listo para conectar con el Backend (Paso 3).');
      
      setCargando(false);
    } else {
      setMensaje('Por favor, corrija los errores antes de continuar.');
    }
  };

  return ( //aca debe ir todo el codigo del form donde usaremos los .map para generar los inputs y el select.
    <div
      className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-zinc-200"
    >
      <h2 className="text-2xl font-bold text-zinc-800 mb-2">Datos del Comprador</h2>
      <p className="text-zinc-500 mb-6">Informacion de contacto del comprador.</p>

      {/* Mostrar mensaje general si existe */}
      {mensaje && <p className="text-red-600 font-medium mb-4 text-center">{mensaje}</p>}

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
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={cargando}
            />
            {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Apellido</label>
            <input
              type="text" name="apellido" value={datosCompra.apellido} onChange={manejarCambioInput}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={cargando}
            />
            {errores.apellido && <p className="text-red-500 text-xs mt-1">{errores.apellido}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Documento (DNI)</label>
            <input
              type="text" name="documento" value={datosCompra.documento} onChange={manejarCambioInput}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={cargando}
            />
            {errores.documento && <p className="text-red-500 text-xs mt-1">{errores.documento}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input
              type="email" name="email" value={datosCompra.email} onChange={manejarCambioInput}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={cargando}
            />
            {errores.email && <p className="text-red-500 text-xs mt-1">{errores.email}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Teléfono</label>
            <input
              type="tel" name="telefono" value={datosCompra.telefono} onChange={manejarCambioInput}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={cargando}
            />
            {errores.telefono && <p className="text-red-500 text-xs mt-1">{errores.telefono}</p>}
          </div>
        </div>

        {/* CAMPOS DE UBICACION Y CANTIDAD (Parte 2 del Formulario) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-200">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Provincia</label>
            <select
              name="provincia" value={datosCompra.provincia} onChange={manejarCambioInput}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              disabled={cargando}
            >
              <option value="">Selecciona tu provincia</option>
              {provincias.map(provincia => ( //aca esta el listado de provincias
                <option key={provincia} value={provincia}>{provincia}</option>
              ))}
            </select>
            {errores.provincia && <p className="text-red-500 text-xs mt-1">{errores.provincia}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Localidad</label>
            <input
              type="text" name="localidad" value={datosCompra.localidad} onChange={manejarCambioInput}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={cargando}
            />
            {/* aca va la seleccion de localidades que saldran al seleccionar una provincia. */}
            {errores.localidad && <p className="text-red-500 text-xs mt-1">{errores.localidad}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Cantidad de entradas (Máx. 6)</label>
            <input
              type="number" name="cantidad" min="1" max="6" value={datosCompra.cantidad} onChange={manejarCambioInput}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={cargando}
            />
            {/* ACA VA LA CANTIDAD DE ENTRADAS QUE SE PUEDEN COMPRAR(MAX 6). */}
            {errores.cantidad && <p className="text-red-500 text-xs mt-1">{errores.cantidad}</p>}
          </div>
        </div>

        {/* BOTÓN DE ENVÍO */}
        <button 
          type="submit" 
          disabled={cargando}
          className={`w-full text-white font-bold py-4 rounded-xl mt-8 transition-all shadow-lg 
            ${cargando ? 'bg-zinc-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'}`}
        >
          {cargando ? 'Conectando con Backend...' : 'Validar Datos y Continuar'}
        </button>
      </form>
    </div>
  );
}

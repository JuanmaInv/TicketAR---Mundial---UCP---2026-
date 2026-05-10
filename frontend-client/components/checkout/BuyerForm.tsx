'use client';

import { useState } from 'react';
import { DatosCompra } from '@/types/ticket';

type CampoFormulario = Exclude<keyof DatosCompra, 'partidoId'>;

export default function BuyerForm({ partidoId, onValidacionExitosa }: { partidoId: string; onValidacionExitosa: (datos: DatosCompra) => void }) {
  const [datosCompra, setDatosCompra] = useState<DatosCompra>({
    partidoId,
    cantidad: 1,
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    telefono: '',
    provincia: '',
    localidad: '',
  });

  const [errores, setErrores] = useState<Partial<Record<CampoFormulario, string>>>({});

  const provincias = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes', 'Entre Rios',
    'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquen',
    'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
    'Santiago del Estero', 'Tierra del Fuego', 'Tucuman',
  ];

  const validarCampo = (nombreCampo: CampoFormulario, valor: string | number) => {
    let error = '';
    const valorStr = valor.toString().trim();

    if (!valorStr && nombreCampo !== 'cantidad') {
      return '* Este campo es obligatorio.';
    }

    if (nombreCampo === 'cantidad') {
      const cant = typeof valor === 'number' ? valor : parseInt(valor, 10) || 0;
      if (cant < 1 || cant > 6) error = '* La cantidad debe ser entre 1 y 6 entradas.';
    } else if (nombreCampo === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorStr)) error = '* Por favor ingresa un email valido.';
    } else if (nombreCampo === 'nombre' || nombreCampo === 'apellido') {
      if (!/^[a-zA-Z\s]+$/.test(valorStr)) {
        error = '* Solo se permiten letras y espacios.';
      } else if (valorStr.length < 2) {
        error = '* Debe tener al menos 2 caracteres.';
      }
    } else if (nombreCampo === 'documento') {
      if (!/^\d{7,8}$/.test(valorStr)) error = '* El DNI debe tener 7 u 8 numeros (sin puntos).';
    } else if (nombreCampo === 'telefono') {
      if (!/^\d{8,15}$/.test(valorStr)) error = '* Debe contener solo numeros (minimo 8 digitos).';
    }

    return error;
  };

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const campo = e.target.name as CampoFormulario;
    const value = e.target.value;
    const nuevoValor = campo === 'cantidad' ? (value === '' ? 0 : parseInt(value, 10)) : value;

    setDatosCompra((prev) => ({ ...prev, [campo]: nuevoValor }));

    const errorDelCampo = validarCampo(campo, nuevoValor);
    setErrores((prev) => ({ ...prev, [campo]: errorDelCampo }));
  };

  const validarFormulario = () => {
    const nuevosErrores: Partial<Record<CampoFormulario, string>> = {};

    (Object.keys(datosCompra) as Array<keyof DatosCompra>).forEach((key) => {
      if (key === 'partidoId') return;
      const campo = key as CampoFormulario;
      const errorMsg = validarCampo(campo, datosCompra[campo]);
      if (errorMsg) nuevosErrores[campo] = errorMsg;
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarFormulario()) onValidacionExitosa(datosCompra);
  };

  const getInputClass = (nombreCampo: CampoFormulario) =>
    `w-full border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-all text-zinc-900 ${
      errores[nombreCampo]
        ? 'border-red-500 focus:ring-red-500 bg-red-50'
        : 'border-zinc-300 focus:ring-blue-500 bg-white'
    }`;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-zinc-200">
      <h2 className="text-2xl font-bold text-zinc-800 mb-2">Datos del Comprador</h2>
      <p className="text-zinc-500 mb-6">Informacion de contacto del comprador.</p>

      <form className="space-y-4" onSubmit={manejarEnvio}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="buyer-nombre" className="block text-sm font-medium text-zinc-700 mb-1">Nombre</label>
            <input id="buyer-nombre" type="text" name="nombre" value={datosCompra.nombre} onChange={manejarCambioInput} className={getInputClass('nombre')} />
            {errores.nombre && <p className="text-red-500 text-xs mt-1 font-medium">{errores.nombre}</p>}
          </div>
          <div>
            <label htmlFor="buyer-apellido" className="block text-sm font-medium text-zinc-700 mb-1">Apellido</label>
            <input id="buyer-apellido" type="text" name="apellido" value={datosCompra.apellido} onChange={manejarCambioInput} className={getInputClass('apellido')} />
            {errores.apellido && <p className="text-red-500 text-xs mt-1 font-medium">{errores.apellido}</p>}
          </div>
          <div>
            <label htmlFor="buyer-documento" className="block text-sm font-medium text-zinc-700 mb-1">Documento (DNI)</label>
            <input id="buyer-documento" type="text" name="documento" value={datosCompra.documento} onChange={manejarCambioInput} className={getInputClass('documento')} />
            {errores.documento && <p className="text-red-500 text-xs mt-1 font-medium">{errores.documento}</p>}
          </div>
          <div>
            <label htmlFor="buyer-email" className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input id="buyer-email" type="email" name="email" value={datosCompra.email} onChange={manejarCambioInput} className={getInputClass('email')} />
            {errores.email && <p className="text-red-500 text-xs mt-1 font-medium">{errores.email}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="buyer-telefono" className="block text-sm font-medium text-zinc-700 mb-1">Telefono</label>
            <input id="buyer-telefono" type="tel" name="telefono" value={datosCompra.telefono} onChange={manejarCambioInput} className={getInputClass('telefono')} />
            {errores.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{errores.telefono}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-200">
          <div>
            <label htmlFor="buyer-provincia" className="block text-sm font-medium text-zinc-700 mb-1">Provincia</label>
            <select id="buyer-provincia" name="provincia" value={datosCompra.provincia} onChange={manejarCambioInput} className={getInputClass('provincia')}>
              <option value="">Selecciona tu provincia</option>
              {provincias.map((provincia) => (
                <option key={provincia} value={provincia}>{provincia}</option>
              ))}
            </select>
            {errores.provincia && <p className="text-red-500 text-xs mt-1 font-medium">{errores.provincia}</p>}
          </div>
          <div>
            <label htmlFor="buyer-localidad" className="block text-sm font-medium text-zinc-700 mb-1">Localidad</label>
            <input id="buyer-localidad" type="text" name="localidad" value={datosCompra.localidad} onChange={manejarCambioInput} className={getInputClass('localidad')} />
            {errores.localidad && <p className="text-red-500 text-xs mt-1 font-medium">{errores.localidad}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="buyer-cantidad" className="block text-sm font-medium text-zinc-700 mb-1">Cantidad de entradas (Max. 6)</label>
            <input id="buyer-cantidad" type="number" name="cantidad" min="1" max="6" value={datosCompra.cantidad} onChange={manejarCambioInput} className={getInputClass('cantidad')} />
            {errores.cantidad && <p className="text-red-500 text-xs mt-1 font-medium">{errores.cantidad}</p>}
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-8 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          Validar Datos y Continuar
        </button>
      </form>
    </div>
  );
}

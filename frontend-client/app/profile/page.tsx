"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUsuario } from "@/lib/api";

function FormularioPerfil() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    email: "", 
    documentacion: "",
    telefono: "",
    localidad: "",
    provincia: "",
    fechaNacimiento: ""
  });

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const guardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Backend pide email, nombre, apellido, numeroPasaporte
      await createUsuario({
        email: datos.email,
        nombre: datos.nombre,
        apellido: datos.apellido,
        numeroPasaporte: datos.documentacion
      });
      
      router.push(redirectUrl);
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    }
  };

  return (
    <form className="mt-8 space-y-6 relative z-10" onSubmit={guardarDatos}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nombre</label>
          <input
            type="text"
            name="nombre"
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            placeholder="John"
            value={datos.nombre}
            onChange={manejarCambio}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Apellido</label>
          <input
            type="text"
            name="apellido"
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            placeholder="Doe"
            value={datos.apellido}
            onChange={manejarCambio}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Correo Electrónico (Gmail)</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            placeholder="tu@gmail.com"
            value={datos.email}
            onChange={manejarCambio}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">DNI / Documentación</label>
          <input
            type="text"
            name="documentacion"
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            placeholder="12.345.678"
            value={datos.documentacion}
            onChange={manejarCambio}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            placeholder="+54 9 11 ..."
            value={datos.telefono}
            onChange={manejarCambio}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Provincia</label>
          <input
            type="text"
            name="provincia"
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            placeholder="Mendoza"
            value={datos.provincia}
            onChange={manejarCambio}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Localidad</label>
          <input
            type="text"
            name="localidad"
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            placeholder="San Rafael"
            value={datos.localidad}
            onChange={manejarCambio}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Fecha de Nacimiento</label>
          <input
            type="date"
            name="fechaNacimiento"
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            value={datos.fechaNacimiento}
            onChange={manejarCambio}
          />
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl transition-all transform hover:scale-[1.01]"
        >
          Guardar Datos y Continuar
        </button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 text-center mb-10">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
            Mis <span className="text-blue-600">Datos</span>
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
            Completa tu perfil para que podamos emitir tus tickets oficiales de la FIFA.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-white">Cargando...</div>}>
          <FormularioPerfil />
        </Suspense>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUsuario, getUsuario, updateUsuario } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

function FormularioPerfil() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
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
  });

  const [errores, setErrores] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [existeEnDB, setExisteEnDB] = useState(false);

  // Cargar datos existentes
  useEffect(() => {
    async function cargarPerfil() {
      if (isLoaded && user) {
        // Forma robusta de obtener el email en Clerk v7
        const emailClerk = user.emailAddresses[0]?.emailAddress || "";
        
        try {
          const usuarioDB = await getUsuario(emailClerk);
          
          if (usuarioDB) {
            setDatos({
              nombre: usuarioDB.nombre || user.firstName || "",
              apellido: usuarioDB.apellido || user.lastName || "",
              email: emailClerk,
              documentacion: usuarioDB.numeroPasaporte || "",
              telefono: usuarioDB.telefono || "",
              localidad: usuarioDB.localidad || "",
              provincia: usuarioDB.provincia || "",
            });
            setExisteEnDB(true);
          } else {
            setDatos(prev => ({
              ...prev,
              nombre: user.firstName || "",
              apellido: user.lastName || "",
              email: emailClerk
            }));
            setExisteEnDB(false);
          }
        } catch (e) {
          // Si falla la búsqueda, al menos tenemos el email de Clerk
          setDatos(prev => ({ ...prev, email: emailClerk }));
        }
      }
    }
    cargarPerfil();
  }, [isLoaded, user]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const guardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    try {
      const payload = {
        email: datos.email,
        nombre: datos.nombre,
        apellido: datos.apellido,
        numeroPasaporte: datos.documentacion,
        telefono: datos.telefono,
        localidad: datos.localidad,
        provincia: datos.provincia
      };

      if (existeEnDB) {
        await updateUsuario(datos.email, payload);
      } else {
        await createUsuario(payload);
      }
      
      setExito(true);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  if (!isLoaded) return <div className="text-center py-10">Conectando con Clerk...</div>;

  return (
    <form className="mt-8 space-y-6 relative z-10" onSubmit={guardarDatos}>
      {exito && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-2xl text-center font-bold animate-pulse">
          ¡Datos guardados con éxito!
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nombre</label>
          <input type="text" name="nombre" className="w-full px-5 py-4 border border-slate-200 rounded-2xl dark:bg-slate-800 text-slate-900 dark:text-white" value={datos.nombre} onChange={manejarCambio} required />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Apellido</label>
          <input type="text" name="apellido" className="w-full px-5 py-4 border border-slate-200 rounded-2xl dark:bg-slate-800 text-slate-900 dark:text-white" value={datos.apellido} onChange={manejarCambio} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Correo Electrónico (Vínculo Clerk)</label>
          <input type="email" readOnly className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed font-bold" value={datos.email} />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">DNI / Documento</label>
          <input type="text" name="documentacion" className="w-full px-5 py-4 border border-slate-200 rounded-2xl dark:bg-slate-800 text-slate-900 dark:text-white" value={datos.documentacion} onChange={manejarCambio} required />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Teléfono</label>
          <input type="tel" name="telefono" className="w-full px-5 py-4 border border-slate-200 rounded-2xl dark:bg-slate-800 text-slate-900 dark:text-white" value={datos.telefono} onChange={manejarCambio} required />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Provincia</label>
          <input type="text" name="provincia" className="w-full px-5 py-4 border border-slate-200 rounded-2xl dark:bg-slate-800 text-slate-900 dark:text-white" value={datos.provincia} onChange={manejarCambio} required />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Localidad</label>
          <input type="text" name="localidad" className="w-full px-5 py-4 border border-slate-200 rounded-2xl dark:bg-slate-800 text-slate-900 dark:text-white" value={datos.localidad} onChange={manejarCambio} required />
        </div>
      </div>

      <div className="pt-6">
        <button type="submit" disabled={enviando} className={`w-full text-white font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl shadow-xl transition-all ${enviando ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-500'}`}>
          {enviando ? "Guardando..." : "Confirmar Datos y Continuar"}
        </button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2l border border-slate-100 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 text-center mb-10">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">MI <span className="text-blue-600">PERFIL</span></h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-widest">Verifica tu identidad para emitir tus tickets</p>
        </div>
        <Suspense fallback={<div className="text-center">Cargando datos...</div>}>
          <FormularioPerfil />
        </Suspense>
      </div>
    </div>
  );
}

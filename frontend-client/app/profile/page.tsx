"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUsuario, getUsuario, updateUsuario, deleteUsuario } from "@/lib/api";
import { useUser, useClerk } from "@clerk/nextjs";

function FormularioPerfil() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");
  const redirectUrl = matchId ? `/checkout/${matchId}?step=2` : (searchParams.get("redirect") || "/");

  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    email: "", 
    documentacion: "",
    telefono: "",
    localidad: "",
    provincia: "",
  });

  const { signOut } = useClerk();
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [existeEnDB, setExisteEnDB] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [terminosAceptados, setTerminosAceptados] = useState(false);

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
        } catch {
          // Si falla la búsqueda, al menos tenemos el email de Clerk
          setDatos(prev => ({ ...prev, email: emailClerk }));
        }
      }
    }
    cargarPerfil();
  }, [isLoaded, user]);

  const validarCampo = (name: string, value: string) => {
    let error = "";
    if (value.trim() === "") {
      error = "Este campo es requerido";
    } else {
      if (name === "nombre" && value.length < 2) error = "Nombre muy corto";
      if (name === "apellido" && value.length < 2) error = "Apellido muy corto";
      if (name === "documentacion" && value.length < 7) error = "Documento inválido";
      if (name === "telefono" && value.length < 8) error = "Teléfono inválido";
      if (name === "provincia" && value.length < 3) error = "Provincia muy corta";
      if (name === "localidad" && value.length < 3) error = "Localidad muy corta";
    }
    setErrores(prev => ({ ...prev, [name]: error }));
  };

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
    validarCampo(e.target.name, e.target.value);
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
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      alert("Error al guardar: " + msg);
    } finally {
      setEnviando(false);
    }
  };
  const eliminarCuenta = async () => {
    if (!confirm("¿ESTÁS SEGURO? Esta acción eliminará permanentemente tu cuenta y no podrás recuperar tus entradas (En caso de haber comprado).")) return;
    
    setEliminando(true);
    try {
      const ok = await deleteUsuario(datos.email);
      if (ok) {
        alert("Cuenta y datos eliminados de TicketAR exitosamente.");
        await signOut();
        router.push("/");
      } else {
        alert("Hubo un problema. Si el backend aún no implementó la ruta DELETE, esto fallará. (Status != 200)");
      }
    } catch {
      alert("Error de conexión al intentar eliminar la cuenta.");
    }
    setEliminando(false);
  };

  if (!isLoaded) return <div className="text-center py-10 text-foreground">Conectando con Clerk...</div>;
  return (
    <main className="min-h-screen bg-background py-16 px-4 transition-colors duration-500 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl">
        
        {/* TÍTULO Y HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-2">
            <span className="text-foreground">MI</span> <span className="text-blue-600">PERFIL</span>
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
            Verifica tu identidad para emitir tus tickets
          </p>
        </div>

        <form className="space-y-8" onSubmit={guardarDatos}>
          {exito && (
            <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 p-6 rounded-2xl text-center font-black animate-bounce">
              ¡DATOS GUARDADOS CON ÉXITO!
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* NOMBRE */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-foreground">Nombre</label>
              <input 
                type="text" 
                name="nombre" 
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.nombre ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-blue-500/20'}`} 
                value={datos.nombre} 
                onChange={manejarCambio} 
                required 
              />
              {errores.nombre && <p className="text-red-500 text-xs font-bold mt-1 animate-pulse">{errores.nombre}</p>}
            </div>
            
            {/* APELLIDO */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-foreground">Apellido</label>
              <input 
                type="text" 
                name="apellido" 
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.apellido ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-blue-500/20'}`} 
                value={datos.apellido} 
                onChange={manejarCambio} 
                required 
              />
              {errores.apellido && <p className="text-red-500 text-xs font-bold mt-1 animate-pulse">{errores.apellido}</p>}
            </div>
          </div>

          {/* EMAIL (FULL WIDTH) */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-foreground">Correo Electrónico (Vínculo Clerk)</label>
            <input 
              type="email" 
              className="w-full px-6 py-5 border-2 border-border rounded-[1.5rem] bg-card text-foreground font-bold opacity-70 cursor-not-allowed text-lg" 
              value={datos.email} 
              readOnly 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DNI */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-foreground">DNI / Documento</label>
              <input 
                type="text" 
                name="documentacion" 
                placeholder="Ej: 44196097"
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.documentacion ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-blue-500/20'}`} 
                value={datos.documentacion} 
                onChange={manejarCambio} 
                required 
              />
              {errores.documentacion && <p className="text-red-500 text-xs font-bold mt-1 animate-pulse">{errores.documentacion}</p>}
            </div>

            {/* TELÉFONO */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-foreground">Teléfono</label>
              <input 
                type="tel" 
                name="telefono" 
                placeholder="Ej: 3794613813"
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.telefono ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-blue-500/20'}`} 
                value={datos.telefono} 
                onChange={manejarCambio} 
                required 
              />
              {errores.telefono && <p className="text-red-500 text-xs font-bold mt-1 animate-pulse">{errores.telefono}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PROVINCIA */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-foreground">Provincia</label>
              <input 
                type="text" 
                name="provincia" 
                placeholder="Ej: Corrientes"
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.provincia ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-blue-500/20'}`} 
                value={datos.provincia} 
                onChange={manejarCambio} 
                required 
              />
              {errores.provincia && <p className="text-red-500 text-xs font-bold mt-1 animate-pulse">{errores.provincia}</p>}
            </div>

            {/* LOCALIDAD */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-foreground">Localidad</label>
              <input 
                type="text" 
                name="localidad" 
                placeholder="Ej: Ciudad de Corrientes"
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.localidad ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-blue-500/20'}`} 
                value={datos.localidad} 
                onChange={manejarCambio} 
                required 
              />
              {errores.localidad && <p className="text-red-500 text-xs font-bold mt-1 animate-pulse">{errores.localidad}</p>}
            </div>
          </div>

          {!existeEnDB && (
            <div className="flex items-start gap-4 mt-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <input 
                type="checkbox" 
                id="terminos" 
                checked={terminosAceptados}
                onChange={(e) => setTerminosAceptados(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-background"
              />
              <label htmlFor="terminos" className="text-xs text-muted-foreground font-medium leading-relaxed">
                Acepto los <span className="text-blue-500 font-bold cursor-pointer hover:underline">Términos y Condiciones</span> y las <span className="text-blue-500 font-bold cursor-pointer hover:underline">Políticas de Privacidad</span> de TicketAR para la compra y gestión de entradas oficiales, así como las normativas impuestas por la FIFA.
              </label>
            </div>
          )}

          {/* BOTÓN DE ACCIÓN DINÁMICO */}
          <button 
            type="submit" 
            disabled={enviando || (!existeEnDB && !terminosAceptados)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-emerald-950/20 text-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-12"
          >
            {enviando ? 'GUARDANDO...' : (matchId ? 'CONFIRMAR Y ELEGIR UBICACIÓN →' : 'GUARDAR CAMBIOS')}
          </button>

          {/* ZONA DE PELIGRO: DARSE DE BAJA */}
          {existeEnDB && (
            <div className="mt-16 p-8 border-2 border-red-500/20 bg-red-500/5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-red-500/40">
              <div className="text-center md:text-left">
                <p className="text-red-500 text-lg uppercase tracking-widest font-black italic mb-1">Zona de Peligro</p>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Al eliminar tu cuenta perderás todos tus tickets.</p>
              </div>
              <button 
                type="button"
                onClick={eliminarCuenta}
                disabled={eliminando}
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-900/20 active:scale-95 whitespace-nowrap"
              >
                {eliminando ? "PROCESANDO..." : "ELIMINAR CUENTA"}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen py-20 px-4 bg-background transition-colors duration-500 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-card p-10 rounded-[3rem] shadow-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 text-center mb-10">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">MI <span className="text-blue-600">PERFIL</span></h2>
          <p className="mt-3 text-muted-foreground font-medium text-xs uppercase tracking-widest">Verifica tu identidad para emitir tus tickets</p>
        </div>
        <Suspense fallback={<div className="text-center text-foreground">Cargando datos...</div>}>
          <FormularioPerfil />
        </Suspense>
      </div>
    </div>
  );
}

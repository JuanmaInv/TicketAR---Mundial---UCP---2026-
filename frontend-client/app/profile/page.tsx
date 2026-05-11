"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUsuario, eliminarMiCuenta, getUsuario, updateUsuario } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

function FormularioPerfil() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const userId = user?.id ?? "";
  const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";
  const userFirstName = user?.firstName ?? "";
  const userLastName = user?.lastName ?? "";
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);
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

  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [existeEnDB, setExisteEnDB] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validarCampo(nombre: string, valor: string): string {
    const limpio = valor.trim();
    if (!limpio) return "Este campo es obligatorio.";

    if (nombre === "documentacion" && !/^[a-zA-Z0-9]{6,20}$/.test(limpio)) {
      return "Ingresa un DNI/Pasaporte valido (6 a 20 caracteres alfanumericos).";
    }

    if (nombre === "telefono" && !/^[0-9+\-\s()]{8,20}$/.test(limpio)) {
      return "Ingresa un telefono valido (8 a 20 caracteres).";
    }

    if (
      (nombre === "nombre" ||
        nombre === "apellido" ||
        nombre === "provincia" ||
        nombre === "localidad") &&
      limpio.length < 2
    ) {
      return "Debe tener al menos 2 caracteres.";
    }

    return "";
  }

  const errores = {
    nombre: validarCampo("nombre", datos.nombre),
    apellido: validarCampo("apellido", datos.apellido),
    documentacion: validarCampo("documentacion", datos.documentacion),
    telefono: validarCampo("telefono", datos.telefono),
    provincia: validarCampo("provincia", datos.provincia),
    localidad: validarCampo("localidad", datos.localidad),
  };

  const formularioValido = Object.values(errores).every((error) => !error);

  useEffect(() => {
    async function cargarPerfil() {
      if (!isLoaded || !userId || !userEmail) return;

      try {
        const usuarioDB = await getUsuario(userEmail, {
          userId,
          userEmail,
        });

        if (usuarioDB) {
          setDatos({
            nombre: usuarioDB.nombre || userFirstName,
            apellido: usuarioDB.apellido || userLastName,
            email: userEmail,
            documentacion: usuarioDB.numeroPasaporte || "",
            telefono: usuarioDB.telefono || "",
            localidad: usuarioDB.localidad || "",
            provincia: usuarioDB.provincia || "",
          });
          setExisteEnDB(true);
        } else {
          setDatos((prev) => ({
            ...prev,
            nombre: userFirstName,
            apellido: userLastName,
            email: userEmail,
          }));
          setExisteEnDB(false);
        }
      } catch {
        setDatos((prev) => ({ ...prev, email: userEmail }));
      }
    }

    void cargarPerfil();
  }, [isLoaded, userEmail, userFirstName, userId, userLastName]);

  function manejarCambio(e: React.ChangeEvent<HTMLInputElement>) {
    setExito(false);
    setMensajeError("");
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
  }

  function manejarBlur(e: React.FocusEvent<HTMLInputElement>) {
    const campo = e.target.name;
    setTouched((prev) => ({ ...prev, [campo]: true }));
  }

  async function guardarDatos(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      setMensajeError("Tu sesion no esta activa. Inicia sesion nuevamente.");
      return;
    }

    if (!formularioValido) {
      setTouched({
        nombre: true,
        apellido: true,
        documentacion: true,
        telefono: true,
        provincia: true,
        localidad: true,
      });
      setMensajeError("Revisa los campos marcados antes de guardar.");
      return;
    }

    setEnviando(true);
    setMensajeError("");

    try {
      const payload = {
        email: datos.email,
        nombre: datos.nombre,
        apellido: datos.apellido,
        numeroPasaporte: datos.documentacion,
        telefono: datos.telefono,
        localidad: datos.localidad,
        provincia: datos.provincia,
      };

      if (existeEnDB) {
        await updateUsuario(datos.email, payload, {
          userId: user.id,
          userEmail: datos.email,
        });
      } else {
        await createUsuario(payload);
        setExisteEnDB(true);
      }

      setExito(true);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Intenta nuevamente en unos minutos.";
      setMensajeError(`No pudimos guardar tus datos. ${mensaje}`);
    } finally {
      setEnviando(false);
    }
  }

  async function eliminarCuenta() {
    if (!user || !datos.email) return;

    const confirmacion = window.confirm(
      "Esta accion elimina tu cuenta y tus entradas asociadas de forma permanente. Queres continuar?",
    );
    if (!confirmacion) return;

    setEliminandoCuenta(true);
    setMensajeError("");

    try {
      await eliminarMiCuenta({
        userId: user.id,
        userEmail: datos.email,
      });

      const clavesStorage = [
        "checkoutStep",
        "checkoutMatchId",
        "checkoutSelection",
        "checkoutUsuario",
        "checkoutDatosUsuario",
        "checkoutReservaExpiraEn",
        "checkoutExpirationTimestamp",
        "checkoutTimerEnd",
        "ticketReservaActiva",
      ];

      for (const clave of clavesStorage) {
        window.localStorage.removeItem(clave);
        window.sessionStorage.removeItem(clave);
      }

      await user.delete();
      router.push("/");
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Intenta nuevamente en unos minutos.";
      setMensajeError(`No pudimos eliminar tu cuenta. ${mensaje}`);
    } finally {
      setEliminandoCuenta(false);
    }
  }

  if (!isLoaded) {
    return <div className="text-center py-10 text-foreground">Conectando con Clerk...</div>;
  }

  return (
    <main className="min-h-screen bg-background py-16 px-4 transition-colors duration-500 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-2">
            <span className="text-foreground">MI</span> <span className="text-blue-600">PERFIL</span>
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
            Verifica tu identidad para emitir tus tickets
          </p>
        </div>

        <form className="space-y-8" onSubmit={(e) => { void guardarDatos(e); }}>
          {exito && (
            <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 p-6 rounded-2xl text-center font-black animate-bounce">
              DATOS GUARDADOS CON EXITO
            </div>
          )}

          {mensajeError && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-2xl text-center font-bold">
              {mensajeError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="nombre" className="block text-[10px] font-black uppercase tracking-widest text-foreground">Nombre</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.nombre ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-blue-500/20"}`}
                value={datos.nombre}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                required
              />
              {touched.nombre && errores.nombre && (
                <p className="text-red-500 text-xs font-bold">{errores.nombre}</p>
              )}
            </div>

            <div className="space-y-3">
              <label htmlFor="apellido" className="block text-[10px] font-black uppercase tracking-widest text-foreground">Apellido</label>
              <input
                id="apellido"
                type="text"
                name="apellido"
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.apellido ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-blue-500/20"}`}
                value={datos.apellido}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                required
              />
              {touched.apellido && errores.apellido && (
                <p className="text-red-500 text-xs font-bold">{errores.apellido}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-foreground">Correo Electronico (Vinculo Clerk)</label>
            <input
              id="email"
              type="email"
              className="w-full px-6 py-5 border-2 border-border rounded-[1.5rem] bg-card text-foreground font-bold opacity-70 cursor-not-allowed text-lg"
              value={datos.email}
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="documentacion" className="block text-[10px] font-black uppercase tracking-widest text-foreground">DNI / Documento</label>
              <input
                id="documentacion"
                type="text"
                name="documentacion"
                placeholder="Ej: 44196097"
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.documentacion ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-blue-500/20"}`}
                value={datos.documentacion}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                required
              />
              {touched.documentacion && errores.documentacion && (
                <p className="text-red-500 text-xs font-bold">{errores.documentacion}</p>
              )}
            </div>

            <div className="space-y-3">
              <label htmlFor="telefono" className="block text-[10px] font-black uppercase tracking-widest text-foreground">Telefono</label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                placeholder="Ej: 3794613813"
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.telefono ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-blue-500/20"}`}
                value={datos.telefono}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                required
              />
              {touched.telefono && errores.telefono && (
                <p className="text-red-500 text-xs font-bold">{errores.telefono}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="provincia" className="block text-[10px] font-black uppercase tracking-widest text-foreground">Provincia</label>
              <input
                id="provincia"
                type="text"
                name="provincia"
                placeholder="Ej: Corrientes"
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.provincia ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-blue-500/20"}`}
                value={datos.provincia}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                required
              />
              {touched.provincia && errores.provincia && (
                <p className="text-red-500 text-xs font-bold">{errores.provincia}</p>
              )}
            </div>

            <div className="space-y-3">
              <label htmlFor="localidad" className="block text-[10px] font-black uppercase tracking-widest text-foreground">Localidad</label>
              <input
                id="localidad"
                type="text"
                name="localidad"
                placeholder="Ej: Ciudad de Corrientes"
                className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-card text-foreground font-bold focus:ring-4 transition-all outline-none text-lg shadow-sm ${errores.localidad ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-blue-500/20"}`}
                value={datos.localidad}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                required
              />
              {touched.localidad && errores.localidad && (
                <p className="text-red-500 text-xs font-bold">{errores.localidad}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando || !formularioValido}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-emerald-950/20 text-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-12"
          >
            {enviando ? "GUARDANDO..." : (matchId ? "CONFIRMAR Y ELEGIR UBICACION" : "GUARDAR CAMBIOS")}
          </button>

          <div className="mt-8 border border-red-500/40 bg-red-500/10 rounded-2xl p-6">
            <p className="text-red-500 font-black uppercase tracking-widest text-xs mb-4">Zona de peligro</p>
            <button
              type="button"
              disabled={eliminandoCuenta}
              onClick={() => {
                void eliminarCuenta();
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all disabled:opacity-60"
            >
              {eliminandoCuenta ? "ELIMINANDO CUENTA..." : "Eliminar mi cuenta permanentemente"}
            </button>
          </div>
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

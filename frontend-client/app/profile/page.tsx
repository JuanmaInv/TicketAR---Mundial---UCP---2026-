"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUsuario, getUsuario, updateUsuario } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

type CampoFormulario = 'nombre' | 'apellido' | 'documentacion' | 'telefono' | 'provincia' | 'localidad';

function validarCampo(nombre: CampoFormulario, valor: string): string {
  switch (nombre) {
    case 'nombre':
    case 'apellido':
      if (!valor.trim()) return 'Este campo es obligatorio';
      if (valor.trim().length < 2) return 'Mínimo 2 caracteres';
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(valor)) return 'Solo letras y espacios';
      return '';
    case 'documentacion':
      if (!valor.trim()) return 'El documento es obligatorio para ingresar al estadio';
      if (valor.trim().length < 6) return 'Mínimo 6 caracteres';
      if (valor.trim().length > 20) return 'Máximo 20 caracteres';
      if (!/^[a-zA-Z0-9]+$/.test(valor.trim())) return 'Sin espacios ni caracteres especiales (solo letras y números)';
      return '';
    case 'telefono': {
      const soloDigitos = valor.replace(/[\s\-\(\)\+]/g, '');
      if (!valor.trim()) return 'El teléfono es obligatorio';
      if (!/^\d+$/.test(soloDigitos)) return 'Solo números (puede incluir +, espacios o guiones)';
      if (soloDigitos.length < 8) return 'Mínimo 8 dígitos';
      if (soloDigitos.length > 15) return 'Máximo 15 dígitos';
      return '';
    }
    case 'provincia':
    case 'localidad':
      if (!valor.trim()) return 'Este campo es obligatorio';
      if (valor.trim().length < 2) return 'Mínimo 2 caracteres';
      return '';
    default:
      return '';
  }
};

function FormularioPerfil() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const partidoId = searchParams.get("partidoId");
  const redirectUrl = partidoId ? `/checkout/${partidoId}` : (searchParams.get("redirect") || "/");

  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    email: "",
    documentacion: "",
    telefono: "",
    localidad: "",
    provincia: "",
  });

  const [errores, setErrores] = useState<Partial<Record<CampoFormulario, string>>>({});
  const [tocados, setTocados] = useState<Partial<Record<CampoFormulario, boolean>>>({});
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [existeEnDB, setExisteEnDB] = useState(false);

  useEffect(() => {
    async function cargarPerfil() {
      if (isLoaded && user) {
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
          setDatos(prev => ({ ...prev, email: emailClerk }));
        }
      }
    }
    cargarPerfil();
  }, [isLoaded, user]);

  function manejarCambio(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
    
    const n = name as CampoFormulario;
    let isTocado = false;
    switch (n) {
      case 'nombre': isTocado = !!tocados.nombre; break;
      case 'apellido': isTocado = !!tocados.apellido; break;
      case 'documentacion': isTocado = !!tocados.documentacion; break;
      case 'telefono': isTocado = !!tocados.telefono; break;
      case 'provincia': isTocado = !!tocados.provincia; break;
      case 'localidad': isTocado = !!tocados.localidad; break;
    }

    if (isTocado) {
      const error = validarCampo(n, value);
      setErrores(prev => ({ ...prev, [name]: error }));
    }
  }

  function manejarBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setTocados(prev => ({ ...prev, [name]: true }));
    const error = validarCampo(name as CampoFormulario, value);
    setErrores(prev => ({ ...prev, [name]: error }));
  }

  async function guardarDatos(e: React.FormEvent) {
    e.preventDefault();
    
    const eNombre = validarCampo('nombre', datos.nombre);
    const eApellido = validarCampo('apellido', datos.apellido);
    const eDoc = validarCampo('documentacion', datos.documentacion);
    const eTel = validarCampo('telefono', datos.telefono);
    const eProv = validarCampo('provincia', datos.provincia);
    const eLoc = validarCampo('localidad', datos.localidad);

    const nuevosErrores: Partial<Record<CampoFormulario, string>> = {
      ...(eNombre && { nombre: eNombre }),
      ...(eApellido && { apellido: eApellido }),
      ...(eDoc && { documentacion: eDoc }),
      ...(eTel && { telefono: eTel }),
      ...(eProv && { provincia: eProv }),
      ...(eLoc && { localidad: eLoc }),
    };

    setErrores(nuevosErrores);
    setTocados({ nombre: true, apellido: true, documentacion: true, telefono: true, provincia: true, localidad: true });
    
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    try {
      const payload = {
        email: datos.email,
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        numeroPasaporte: datos.documentacion.trim().toUpperCase(),
        telefono: datos.telefono.trim(),
        localidad: datos.localidad.trim(),
        provincia: datos.provincia.trim()
      };
      if (existeEnDB) {
        await updateUsuario(datos.email, payload);
      } else {
        await createUsuario(payload);
      }
      setExito(true);
      setTimeout(() => { router.push(redirectUrl); }, 1500);
    } catch (err) {
      const error = err as Error;
      alert("Error al guardar: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  if (!isLoaded) return <div className="text-center py-10 text-foreground">Conectando con Clerk...</div>;

  function campo(
    nombre: string,
    label: string,
    valor: string,
    error: string | undefined,
    tocado: boolean | undefined,
    tipo: string = 'text',
    placeholder: string = ''
  ) {
    return (
      <div className="space-y-2">
        <label htmlFor={nombre} className="block text-[10px] font-black uppercase tracking-widest text-foreground">
          {label} <span className="text-red-500">*</span>
        </label>
        <input
          id={nombre}
          type={tipo}
          name={nombre}
          placeholder={placeholder}
          className={`w-full px-6 py-4 border-2 rounded-[1.2rem] bg-card text-foreground font-bold outline-none text-base transition-all duration-200 ${
            error
              ? 'border-red-500 focus:border-red-400 bg-red-500/5'
              : tocado && !error
              ? 'border-emerald-500 focus:border-emerald-400'
              : 'border-border focus:border-blue-500'
          }`}
          value={valor}
          onChange={manejarCambio}
          onBlur={manejarBlur}
        />
        {error && (
          <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 animate-in fade-in duration-200">
            <span>⚠</span> {error}
          </p>
        )}
        {tocado && !error && valor.trim() && (
          <p className="text-emerald-500 text-[11px] font-bold flex items-center gap-1">
            <span>✓</span> Correcto
          </p>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-16 px-4 transition-colors duration-500 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-2">
            <span className="text-foreground">MI</span> <span className="text-blue-600">PERFIL</span>
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
            Verifica tu identidad para emitir tus tickets oficiales
          </p>
        </div>

        {/* Info banner */}
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <span className="text-xl shrink-0">🪪</span>
          <p className="text-blue-400 text-xs font-bold leading-relaxed">
            <strong>Importante:</strong> El DNI o Pasaporte que cargues aquí será verificado físicamente en la entrada del estadio. Asegúrate de que coincida exactamente con tu documento oficial.
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => { void guardarDatos(e); }} noValidate>
          {exito && (
            <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 p-6 rounded-2xl text-center font-black animate-in slide-in-from-top-4 duration-500">
              ✅ ¡DATOS GUARDADOS CON ÉXITO! Redirigiendo...
            </div>
          )}

          <div className="bg-card border border-border rounded-[2rem] p-6 md:p-10 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-4">
              Datos Personales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campo('nombre', 'Nombre', datos.nombre, errores.nombre, tocados.nombre, 'text', 'Ej: Juan')}
              {campo('apellido', 'Apellido', datos.apellido, errores.apellido, tocados.apellido, 'text', 'Ej: Pérez')}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-foreground">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-6 py-4 border-2 border-border rounded-[1.2rem] bg-card text-foreground font-bold opacity-60 cursor-not-allowed text-base"
                value={datos.email}
                readOnly
              />
              <p className="text-muted-foreground text-[10px]">El email está vinculado a tu cuenta de Clerk y no se puede modificar aquí.</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2rem] p-6 md:p-10 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-4">
              Documento &amp; Contacto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campo('documentacion', 'DNI / Pasaporte', datos.documentacion, errores.documentacion, tocados.documentacion, 'text', 'Ej: 44196097 o AAB12345')}
              {campo('telefono', 'Teléfono', datos.telefono, errores.telefono, tocados.telefono, 'tel', 'Ej: 3794613813')}
            </div>
            <p className="text-muted-foreground text-[10px] font-bold">
              El DNI/Pasaporte debe ser alfanumérico, sin espacios. El teléfono solo acepta dígitos (mín. 8).
            </p>
          </div>

          <div className="bg-card border border-border rounded-[2rem] p-6 md:p-10 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-4">
              Ubicación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campo('provincia', 'Provincia', datos.provincia, errores.provincia, tocados.provincia, 'text', 'Ej: Corrientes')}
              {campo('localidad', 'Localidad', datos.localidad, errores.localidad, tocados.localidad, 'text', 'Ej: Capital')}
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="relative group w-full overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] italic transition-all shadow-2xl shadow-emerald-500/30 text-lg disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            {enviando ? '⏳ GUARDANDO...' : '✅ GUARDAR Y CONTINUAR'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-foreground">Cargando...</div>}>
      <FormularioPerfil />
    </Suspense>
  );
}

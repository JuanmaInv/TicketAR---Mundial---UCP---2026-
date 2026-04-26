"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [correo, setCorreo] = useState("");
  const [confirmarCorreo, setConfirmarCorreo] = useState("");
  const [errorTexto, setErrorTexto] = useState("");

  const manejarIngreso = (e: React.FormEvent) => {
    e.preventDefault();
    if (correo !== confirmarCorreo) {
      setErrorTexto("Los correos electrónicos no coinciden.");
      return;
    }
    setErrorTexto("");
    
    // Aquí iría la lógica contra el backend (ej: enviar OTP u obtener token temporal)
    console.log("Iniciando sesión / Registrando con:", correo);

    // Redirigir al perfil para completar datos obligatorios antes de comprar
    if (redirectUrl) {
      router.push(`/profile?redirect=${encodeURIComponent(redirectUrl)}`);
    } else {
      router.push("/profile"); 
    }
  };

  return (
    <form className="mt-8 space-y-6 relative z-10" onSubmit={manejarIngreso}>
      <div className="space-y-5">
        {errorTexto && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-bold text-center">
            {errorTexto}
          </div>
        )}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[var(--usa-blue)] focus:ring-1 focus:ring-[var(--usa-blue)] transition-colors"
            placeholder="tu@email.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
            Confirmar Correo
          </label>
          <input
            type="email"
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[var(--usa-blue)] focus:ring-1 focus:ring-[var(--usa-blue)] transition-colors"
            placeholder="Confirma tu correo"
            value={confirmarCorreo}
            onChange={(e) => setConfirmarCorreo(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="group relative flex w-full justify-center rounded-2xl bg-[var(--usa-blue)] px-4 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-blue-800 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,43,127,0.3)]"
        >
          {redirectUrl ? "Continuar con la compra" : "Ingresar"}
        </button>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6 border-t border-gray-100 dark:border-slate-800 pt-6">
        Al continuar, recibirás un enlace mágico o código para validar tu cuenta.
        Podrás completar tus datos personales desde tu perfil.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 hover:border-[var(--usa-blue)] dark:hover:border-[var(--usa-blue)] transition-colors duration-500 bg-white dark:bg-slate-900/80 relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">

        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--canada-red)] rounded-full blur-3xl opacity-10 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--mexico-green)] rounded-full blur-3xl opacity-10 pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="mt-2 text-center text-4xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">
            Iniciar <span className="text-[var(--usa-blue)]">Sesión</span>
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
            Ingresa tu correo. Nos aseguraremos de que tu compra sea 100% segura.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-white">Cargando formulario...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

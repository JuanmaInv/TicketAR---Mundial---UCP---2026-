"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Acá iría la lógica de autenticación real
    console.log("Iniciando sesión con:", email, password);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 hover:border-[var(--usa-blue)] dark:hover:border-[var(--usa-blue)] transition-colors duration-500 bg-white dark:bg-slate-900/80 relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">

        {/* Glow effects para darle el estilo premium del Mundial - Modo Claro */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--canada-red)] rounded-full blur-3xl opacity-10 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--mexico-green)] rounded-full blur-3xl opacity-10 pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="mt-2 text-center text-4xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">
            Iniciar <span className="text-[var(--usa-blue)]">Sesión</span>
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
            Ingresá a tu cuenta para comprar y gestionar tus tickets de la Copa del Mundo.
          </p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleLogin}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[var(--usa-blue)] focus:ring-1 focus:ring-[var(--usa-blue)] transition-colors"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[var(--usa-blue)] focus:ring-1 focus:ring-[var(--usa-blue)] transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[var(--usa-blue)] focus:ring-[var(--usa-blue)]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-semibold text-[var(--usa-blue)] hover:text-blue-800 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-2xl bg-[var(--usa-blue)] px-4 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-blue-800 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,43,127,0.3)]"
            >
              Entrar al Portal
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 border-t border-gray-100 dark:border-slate-800 pt-6">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="font-semibold text-[var(--usa-blue)] hover:text-blue-800 transition-colors">
              Registrate acá
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

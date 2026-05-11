"use client";

import React, { useState } from 'react';

export default function SupportPage() {
  const [enviado, setEnviado] = useState(false);

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="min-h-screen py-20 bg-background text-foreground flex flex-col items-center transition-colors duration-300">
      <div className="container max-w-4xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-foreground mb-4">
            Centro de <span className="text-blue-600">Soporte</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Tienes algun problema con tu compra? Estamos aqui para ayudarte las 24 horas del dia.
          </p>
        </div>

        {enviado ? (
          <div className="glass-panel p-12 rounded-[3rem] text-center bg-card border border-emerald-500/30 shadow-xl">
            <div className="text-6xl mb-6">OK</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Solicitud Enviada</h2>
            <p className="text-muted-foreground">Hemos recibido tu mensaje. Un agente de TicketAR se pondra en contacto contigo en los proximos 15 minutos.</p>
            <button
              type="button"
              onClick={() => setEnviado(false)}
              className="mt-8 text-blue-600 font-bold hover:underline"
            >
              Enviar otra consulta
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <form onSubmit={manejarEnvio} className="glass-panel p-10 rounded-[3rem] bg-card border border-border shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="support-name" className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Nombre Completo</label>
                    <input id="support-name" type="text" required className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label htmlFor="support-email" className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Correo Electronico</label>
                    <input id="support-email" type="email" required className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="tu@email.com" />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="support-subject" className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Asunto</label>
                  <select
                    id="support-subject"
                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 [color-scheme:light] dark:[color-scheme:dark]"
                  >
                    <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Problema con el Pago</option>
                    <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Error en la Seleccion de Asiento</option>
                    <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Consulta de Disponibilidad</option>
                    <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Reclamo / Queja</option>
                    <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Otro</option>
                  </select>
                </div>
                <div className="mb-8">
                  <label htmlFor="support-message" className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Mensaje / Descripcion</label>
                  <textarea id="support-message" required className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground h-32 focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="Describe tu problema en detalle..."></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.01]">
                  Enviar Mensaje Directo
                </button>
              </form>
            </div>

            <div className="md:col-span-1 space-y-6">
              <div className="glass-panel p-8 rounded-[2rem] bg-blue-600 dark:bg-blue-700 text-white shadow-xl">
                <h3 className="font-black uppercase tracking-tighter text-lg mb-2">Chat en Vivo</h3>
                <p className="text-blue-100 text-sm mb-4">Habla con un humano ahora mismo. Tiempo de espera: 2 min.</p>
                <button type="button" className="w-full py-3 bg-white text-blue-700 rounded-xl font-bold text-xs uppercase tracking-widest">Iniciar Chat</button>
              </div>
              <div className="glass-panel p-8 rounded-[2rem] bg-card border border-border shadow-lg">
                <h3 className="font-black uppercase tracking-tighter text-lg mb-2 text-foreground">Llamanos</h3>
                <p className="text-muted-foreground text-sm mb-1">Internacional:</p>
                <p className="font-bold text-blue-600">+1 800-TICKET-AR</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';

export default function SupportPage() {
  const [enviado, setEnviado] = useState(false);

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="min-h-screen py-20 bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
      <div className="container max-w-4xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-4">
            Centro de <span className="text-blue-600">Soporte</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Tienes algun problema con tu compra? Estamos aqui para ayudarte las 24 horas del dia.
          </p>
        </div>

        {enviado ? (
          <div className="glass-panel p-12 rounded-[3rem] text-center bg-white dark:bg-slate-900 border border-emerald-500/30">
            <div className="text-6xl mb-6">OK</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Solicitud Enviada</h2>
            <p className="text-slate-600 dark:text-slate-400">Hemos recibido tu mensaje. Un agente de TicketAR se pondra en contacto contigo en los proximos 15 minutos.</p>
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
              <form onSubmit={manejarEnvio} className="glass-panel p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="support-name" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nombre Completo</label>
                    <input id="support-name" type="text" required className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label htmlFor="support-email" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Correo Electronico</label>
                    <input id="support-email" type="email" required className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white" placeholder="tu@email.com" />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="support-subject" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Asunto</label>
                  <select id="support-subject" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white appearance-none">
                    <option>Problema con el Pago</option>
                    <option>Error en la Seleccion de Asiento</option>
                    <option>Consulta de Disponibilidad</option>
                    <option>Reclamo / Queja</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="mb-8">
                  <label htmlFor="support-message" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Mensaje / Descripcion</label>
                  <textarea id="support-message" required className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white h-32" placeholder="Describe tu problema en detalle..."></textarea>
                </div>
                <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.01]">
                  Enviar Mensaje Directo
                </button>
              </form>
            </div>

            <div className="md:col-span-1 space-y-6">
              <div className="glass-panel p-8 rounded-[2rem] bg-indigo-600 text-white shadow-xl">
                <h3 className="font-black uppercase tracking-tighter text-lg mb-2">Chat en Vivo</h3>
                <p className="text-indigo-100 text-sm mb-4">Habla con un humano ahora mismo. Tiempo de espera: 2 min.</p>
                <button type="button" className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest">Iniciar Chat</button>
              </div>
              <div className="glass-panel p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg">
                <h3 className="font-black uppercase tracking-tighter text-lg mb-2 text-slate-900 dark:text-white">Llamanos</h3>
                <p className="text-slate-500 text-sm mb-1">Internacional:</p>
                <p className="font-bold text-blue-600">+1 800-TICKET-AR</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

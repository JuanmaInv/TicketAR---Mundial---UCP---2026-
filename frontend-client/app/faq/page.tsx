'use client';

import Link from 'next/link';
import { useState } from 'react';

type FaqItem = {
  pregunta: string;
  respuesta: string;
};

const faqs: FaqItem[] = [
  {
    pregunta: 'Cuanto dura la reserva durante la compra?',
    respuesta:
      'La reserva dura 15 minutos. Durante ese tiempo tus entradas quedan apartadas para que completes tus datos y el pago.',
  },
  {
    pregunta: 'Que pasa si vence el timer?',
    respuesta:
      'Si el tiempo llega a cero, la reserva expira y los asientos vuelven al stock general. Debes volver a seleccionar sector y continuar el proceso desde checkout.',
  },
  {
    pregunta: 'Como recibo mi entrada y el codigo QR?',
    respuesta:
      'Cuando el pago se confirma, la entrada aparece en Mis Tickets con su QR correspondiente. El ingreso al estadio se valida con tu identidad y ese QR.',
  },
  {
    pregunta: 'Que hago si Mercado Pago rechaza el pago?',
    respuesta:
      'Revisa el medio de pago e intenta nuevamente. Si el rechazo persiste, prueba con otro medio y verifica que la reserva siga vigente antes de reintentar.',
  },
  {
    pregunta: 'Puedo cambiar mis datos antes de pagar?',
    respuesta:
      'Si. En el checkout puedes volver al paso de datos del comprador y editar la informacion antes de confirmar el pago final.',
  },
  {
    pregunta: 'Que significa que un partido este agotado o cancelado?',
    respuesta:
      'Agotado significa que no hay stock disponible para compra. Cancelado significa que el partido fue bloqueado administrativamente y no permite compras.',
  },
  {
    pregunta: 'Como elimino mi cuenta?',
    respuesta:
      'Desde tu perfil puedes gestionar la eliminacion de cuenta si la opcion esta habilitada para tu usuario. Si no la encuentras, contacta soporte oficial.',
  },
];

export default function FAQPage() {
  const [abierto, setAbierto] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-10">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-[0.4em] inline-flex items-center gap-3 transition-colors group"
          >
            <span className="group-hover:-translate-x-2 transition-transform text-xl">←</span>
            VOLVER AL INICIO
          </Link>
        </div>

        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-foreground uppercase mb-4 leading-none text-center">
          PREGUNTAS <span className="text-blue-600">FRECUENTES</span>
        </h1>
        <p className="text-center text-muted-foreground font-bold uppercase tracking-widest mb-16 italic">
          Informacion clave para comprar en TicketAR Mundial 2026
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <button
              key={faq.pregunta}
              type="button"
              className={`block w-full text-left bg-card border rounded-3xl overflow-hidden transition-all duration-300 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                abierto === index
                  ? 'border-blue-500 shadow-blue-500/10 shadow-xl'
                  : 'border-border hover:border-blue-500/40'
              }`}
              onClick={() => {
                setAbierto(abierto === index ? null : index);
              }}
            >
              <div className="flex items-center justify-between p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">•</span>
                  <h3 className="text-base md:text-lg font-black text-foreground uppercase italic">
                    {faq.pregunta}
                  </h3>
                </div>
                <span
                  className={`text-blue-600 font-black text-xl transition-transform duration-300 shrink-0 ml-4 ${
                    abierto === index ? 'rotate-180' : ''
                  }`}
                >
                  {abierto === index ? '▴' : '▾'}
                </span>
              </div>

              {abierto === index && (
                <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="h-px bg-border mb-5" />
                  <p className="text-muted-foreground font-medium leading-relaxed pl-10">
                    {faq.respuesta}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-blue-500/20">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">
            Aun tienes dudas?
          </h2>
          <p className="font-bold opacity-90 mb-8">
            Nuestro equipo de soporte esta disponible para ayudarte con tu compra.
          </p>
          <a
            href="/support"
            className="inline-block bg-white text-blue-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest italic hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            CONTACTAR SOPORTE
          </a>
        </div>
      </div>
    </main>
  );
}

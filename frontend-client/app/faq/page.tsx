'use client';

import { useState } from 'react';

const faqs = [
  {
    pregunta: "¿Cuántas entradas puedo comprar?",
    respuesta: "Cada usuario puede comprar un máximo de 6 entradas por partido. Esto garantiza que más fanáticos puedan asistir y evita la reventa ilegal. El titular de la cuenta es responsable de todo el grupo.",
    icon: "🎟️"
  },
  {
    pregunta: "¿Es obligatorio presentar documento de identidad?",
    respuesta: "Sí. Tu DNI o Pasaporte cargado en el perfil es OBLIGATORIO para validar tu identidad en la entrada del estadio. El titular del ticket debe presentar el documento físico coincidente. Sin coincidencia de datos, el ingreso será DENEGADO. Esto aplica para cada persona del grupo.",
    icon: "🪪"
  },
  {
    pregunta: "¿Qué pasa si se agota un sector?",
    respuesta: "Si un sector (como Platea) se agota, el sistema lo bloqueará automáticamente y no podrás seleccionarlo. Podrás seguir comprando en otros sectores disponibles (Popular o Palco) para el mismo partido.",
    icon: "📍"
  },
  {
    pregunta: "¿Los tickets son reembolsables?",
    respuesta: "NO. Las entradas de TicketAR no tienen devolución ni reembolso bajo ningún concepto. La funcionalidad de reembolso no está implementada en esta plataforma. Una vez confirmado el pago, la compra es definitiva e irreversible.",
    icon: "❌"
  },
  {
    pregunta: "¿Cómo recibo mis entradas?",
    respuesta: "Una vez confirmado el pago, tus entradas aparecerán en la sección 'Mis Entradas' con un código QR único por ticket. Deberás presentar este QR desde tu dispositivo móvil en la entrada del estadio. No se envían tickets físicos ni por email.",
    icon: "📱"
  },
  {
    pregunta: "¿Puedo transferir mis tickets a otra persona?",
    respuesta: "No. Los tickets son personales e intransferibles. El titular debe ser quien ingrese y presentar su documento de identidad. Esto es parte del sistema anti-reventa de TicketAR que protege la integridad del evento.",
    icon: "🔒"
  },
  {
    pregunta: "¿Qué pasa si hay un error al comprar?",
    respuesta: "El sistema te mostrará un mensaje descriptivo con el motivo del error y los pasos a seguir. Los errores más comunes son: tarjeta rechazada (intenta con otro medio), sector agotado (elige otra ubicación) o sesión expirada (reinicia el proceso). Si el problema persiste, contacta a soporte.",
    icon: "⚙️"
  },
];

export default function FAQPage() {
  const [abierto, setAbierto] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-foreground uppercase mb-4 leading-none text-center">
          PREGUNTAS <span className="text-blue-600">FRECUENTES</span>
        </h1>
        <p className="text-center text-muted-foreground font-bold uppercase tracking-widest mb-16 italic">
          Todo lo que necesitas saber sobre TicketAR Mundial 2026
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.pregunta}
              role="button"
              tabIndex={0}
              className={`bg-card border rounded-3xl overflow-hidden transition-all duration-300 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                abierto === index ? 'border-blue-500 shadow-blue-500/10 shadow-xl' : 'border-border hover:border-blue-500/40'
              }`}
              onClick={() => { setAbierto(abierto === index ? null : index); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setAbierto(abierto === index ? null : index);
                }
              }}
            >
              <div className="flex items-center justify-between p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{faq.icon}</span>
                  <h3 className="text-base md:text-lg font-black text-foreground uppercase italic">
                    {faq.pregunta}
                  </h3>
                </div>
                <span className={`text-blue-600 font-black text-xl transition-transform duration-300 shrink-0 ml-4 ${abierto === index ? 'rotate-180' : ''}`}>
                  ▼
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
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-blue-500/20">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">¿Aún tienes dudas?</h2>
          <p className="font-bold opacity-90 mb-8">Nuestro equipo de soporte está disponible para ayudarte con tu compra.</p>
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

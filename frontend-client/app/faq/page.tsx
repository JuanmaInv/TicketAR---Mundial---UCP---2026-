'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Cuántas entradas puedo comprar por usuario?",
      answer: "Por disposición oficial y para garantizar equidad, cada usuario validado con su documento (DNI/Pasaporte) puede adquirir un máximo de 6 entradas por partido."
    },
    {
      question: "¿Cómo ingreso al estadio el día del partido?",
      answer: "El ingreso es estrictamente presentando el documento de identidad registrado en tu cuenta (DNI o Pasaporte) y el Código QR generado en la plataforma. El titular de la compra debe estar presente."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Actualmente procesamos todos nuestros pagos a través de Mercado Pago, permitiendo el uso de tarjetas de crédito, débito y dinero en cuenta. Tu transacción está totalmente protegida."
    },
    {
      question: "¿Qué pasa si se me acaba el tiempo durante la compra?",
      answer: "El sistema reserva tu lugar por 15 minutos mientras completás tus datos. Si el reloj llega a cero, las entradas vuelven a liberarse y deberás intentar nuevamente."
    }
  ];

  return (
    <main className="min-h-screen py-20 px-6 bg-background relative overflow-hidden transition-colors duration-500">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <span className="text-[20rem] font-black italic">?</span>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-16 text-center md:text-left">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-[0.4em] mb-8 inline-flex items-center gap-3 transition-colors group">
            <span className="group-hover:-translate-x-3 transition-transform text-xl">←</span> VOLVER AL INICIO
          </Link>
          <h1 className="text-6xl md:text-8xl font-black text-foreground uppercase italic tracking-tighter leading-none mb-6">
            Preguntas <span className="text-blue-600">Frecuentes</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-bold uppercase tracking-widest italic md:border-l-4 md:border-blue-600 md:pl-4">
            Todo lo que necesitas saber sobre TicketAR
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-card border-2 transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer shadow-xl ${openIndex === index ? 'border-blue-500 shadow-blue-500/20' : 'border-border hover:border-white/20'}`}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                <h3 className={`text-xl md:text-2xl font-black italic tracking-tight uppercase ${openIndex === index ? 'text-blue-500' : 'text-foreground'}`}>
                  {faq.question}
                </h3>
                <span className={`text-2xl font-black transition-transform duration-500 ${openIndex === index ? 'rotate-180 text-blue-500' : 'text-muted-foreground'}`}>
                  ▼
                </span>
              </div>
              
              <div 
                className={`px-6 md:px-8 transition-all duration-500 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed border-t border-white/10 pt-6">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-card p-12 rounded-[3rem] border border-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <span className="text-6xl mb-6 block relative z-10">📞</span>
          <p className="text-foreground text-2xl font-black uppercase tracking-widest italic mb-2 relative z-10">¿Todavía tenés dudas?</p>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-10 relative z-10">
            Nuestros canales oficiales de TicketAR están abiertos para reclamos o consultas
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 relative z-10">
            <div className="bg-background border border-border px-8 py-6 rounded-2xl flex flex-col items-center shadow-lg w-full md:w-auto">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-2">WhatsApp / Teléfono</span>
              <span className="text-xl font-black text-foreground">+54 9 11 1234-5678</span>
            </div>
            <div className="bg-background border border-border px-8 py-6 rounded-2xl flex flex-col items-center shadow-lg w-full md:w-auto">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-2">Correo Oficial TicketAR</span>
              <a href="mailto:soporte@ticketar.com.ar" className="text-xl font-black text-blue-500 hover:text-blue-400 transition-colors">soporte@ticketar.com.ar</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

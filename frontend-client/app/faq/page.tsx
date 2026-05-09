'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Cuántas entradas puedo comprar por usuario?",
      answer: "Por disposición oficial y para evitar la reventa, cada usuario registrado y validado con su documento oficial (DNI/Pasaporte) puede adquirir un máximo de 6 entradas por partido."
    },
    {
      question: "¿Cómo ingreso al estadio el día del partido?",
      answer: "El ingreso es estrictamente con el documento de identidad registrado en tu cuenta (DNI o Pasaporte) y el Código QR generado tras la compra. El titular de la cuenta debe estar presente con su grupo."
    },
    {
      question: "¿Puedo revender o transferir mis entradas?",
      answer: "La transferencia directa de entradas está prohibida. TicketAR cuenta con una plataforma oficial de reventa segura donde puedes devolver tu entrada, y nosotros nos encargamos de reasignarla garantizando un proceso legal y sin sobreprecios."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Actualmente procesamos los pagos a través de Mercado Pago, lo cual te permite abonar con tarjetas de crédito, débito y dinero en cuenta. Tu pago está protegido y procesado instantáneamente."
    },
    {
      question: "¿Qué pasa si se me acaba el tiempo durante la compra?",
      answer: "El sistema reserva tu lugar por 15 minutos mientras completas los datos. Si el tiempo expira, las entradas vuelven a liberarse para otros usuarios y deberás comenzar el proceso nuevamente."
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

        <div className="mt-20 text-center bg-card p-12 rounded-[3rem] border border-border shadow-2xl">
          <span className="text-6xl mb-6 block">🌍</span>
          <p className="text-foreground text-xl font-black uppercase tracking-widest italic mb-2">¿Aún tienes dudas?</p>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-8">El soporte oficial de FIFA está a tu disposición 24/7</p>
          <a href="mailto:soporte@ticketar.com" className="inline-flex bg-foreground text-background px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] italic hover:scale-105 active:scale-95 transition-all shadow-2xl">
            Contactar Soporte →
          </a>
        </div>
      </div>
    </main>
  );
}

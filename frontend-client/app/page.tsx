'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ComponenteCalendario from '@/components/calendar/CalendarComponent';
import WorldCupLoader from '@/components/WorldCupLoader';
import Bandera from '@/components/Bandera';

export default function Home() {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Simulamos un leve retraso para que se luzca el WorldCupLoader que pediste conservar
    const timer = setTimeout(() => {
      setCargando(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (cargando) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <WorldCupLoader />
        <p className="mt-8 text-slate-500 font-bold tracking-widest uppercase text-sm animate-pulse">
          Cargando la experiencia...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 1. HERO SECTION (Marketing y Venta) - Con las banderas anfitrionas arriba */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-slate-950 flex flex-col items-center justify-center border-b border-slate-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          
          {/* Banderas de los anfitriones (Canadá, EEUU, México) */}
          <div className="flex justify-center gap-6 mb-8 md:mb-12">
            <div className="flex flex-col items-center gap-2 transform -rotate-6 hover:scale-110 transition-transform">
              <div className="w-16 h-12 md:w-24 md:h-16 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,0,0,0.5)] border-2 border-slate-800">
                <Bandera pais="Canadá" fill />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ce1126]">Canadá</span>
            </div>
            <div className="flex flex-col items-center gap-2 transform z-10 hover:scale-110 transition-transform">
              <div className="w-20 h-14 md:w-28 md:h-20 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(0,43,127,0.6)] border-2 border-slate-800">
                <Bandera pais="Estados Unidos" fill />
              </div>
              <span className="text-[12px] font-black uppercase tracking-widest text-slate-200">EE.UU.</span>
            </div>
            <div className="flex flex-col items-center gap-2 transform rotate-6 hover:scale-110 transition-transform">
              <div className="w-16 h-12 md:w-24 md:h-16 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,104,71,0.5)] border-2 border-slate-800">
                <Bandera pais="México" fill />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#006847]">México</span>
            </div>
          </div>

          <span className="inline-block py-1 px-4 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            Asegura tu lugar en la historia
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 uppercase italic drop-shadow-2xl">
            Vive la Pasión del <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Mundial 2026</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 font-medium mb-10 leading-relaxed">
            TicketAR es la plataforma de tecnología avanzada que te garantiza acceso oficial a todos los estadios. Selecciona tu asiento en tiempo real y obtén tu pase digital de manera instantánea.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#calendario" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black tracking-widest uppercase text-sm transition-all transform hover:scale-105 shadow-[0_10px_30px_rgba(37,99,235,0.4)]">
              Ver Partidos
            </a>
            <Link href="/about" className="px-8 py-4 bg-transparent border border-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold tracking-widest uppercase text-sm transition-all">
              Conoce el Equipo
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CALENDARIO DE PARTIDOS */}
      <section id="calendario" className="py-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
              Próximos <span className="text-blue-600">Encuentros</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Explora el calendario oficial y asegura tu lugar en los mejores partidos.</p>
          </div>

          <ComponenteCalendario />
        </div>
      </section>

      {/* 3. INSTRUCCIONES DEL FLUJO DE COMPRA */}
      <section className="py-20 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
              ¿Cómo comprar tu <span className="text-emerald-500">entrada?</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Un proceso diseñado para ser rápido, transparente y 100% seguro.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: "01",
                title: "Elige tu Partido", 
                desc: "Usa el calendario interactivo para encontrar el encuentro que no te quieres perder. Contamos con acceso a todos los grupos y fases finales.",
                icon: "🗓️"
              },
              { 
                step: "02",
                title: "Completa tus Datos", 
                desc: "Crea tu cuenta segura e ingresa tu información. Necesitarás tu correo electrónico para recibir confirmaciones y validar tu identidad.",
                icon: "📝"
              },
              { 
                step: "03",
                title: "Pago y Tickets", 
                desc: "Selecciona el sector, paga en tu moneda local y recibe de inmediato tu ticket digital con código encriptado imposible de falsificar.",
                icon: "🎟️"
              }
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-colors group">
                <div className="absolute top-6 right-6 text-5xl font-black text-slate-200 dark:text-slate-800/80 group-hover:text-blue-500/10 transition-colors">
                  {item.step}
                </div>
                <div className="text-4xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 relative z-10">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 relative z-10 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. REDIRECCIÓN A SOBRE NOSOTROS */}
      <section className="py-24 bg-gradient-to-tr from-blue-950 via-slate-900 to-black relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-6">
            La Mejor Experiencia <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Garantizada</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-300 mb-10 text-lg leading-relaxed">
            Detrás de TicketAR hay un equipo de expertos obsesionados con la seguridad de tu compra. Conoce a los profesionales que hacen posible que vivas la fiesta más grande del fútbol sin preocupaciones.
          </p>
          <Link href="/about" className="inline-block px-8 py-4 bg-white text-slate-900 rounded-xl font-black tracking-widest uppercase text-sm transition-all transform hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Descubre Sobre Nosotros
          </Link>
        </div>
      </section>
    </div>
  );
}

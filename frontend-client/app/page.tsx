'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ComponenteCalendario from '@/components/calendar/CalendarComponent';
import WorldCupLoader from '@/components/WorldCupLoader';
import Bandera from '@/components/Bandera';

export default function Home() {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
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
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      
      {/* 1. HERO SECTION - CON BANDERAS ANFITRIONAS RESTAURADAS */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-slate-950 flex flex-col items-center justify-center border-b border-border">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          {/* 🚩 FONDO DE BANDERAS ANFITRIONAS (Vibrantes) */}
          <div className="absolute inset-0 flex opacity-20 pointer-events-none -z-10">
            <div className="flex-1 transform -skew-x-12 scale-110"><Bandera pais="MÉXICO" fill={true} /></div>
            <div className="flex-1 transform -skew-x-12 scale-110 border-x border-white/10"><Bandera pais="ESTADOS UNIDOS" fill={true} /></div>
            <div className="flex-1 transform -skew-x-12 scale-110"><Bandera pais="CANADÁ" fill={true} /></div>
          </div>
          
          {/* REGRESO DE LAS BANDERAS ANFITRIONAS (Tarjetas) */}
          <div className="flex justify-center gap-6 mb-12">
            <div className="flex flex-col items-center gap-2 transform -rotate-6 hover:scale-110 transition-transform">
              <div className="w-16 h-12 md:w-24 md:h-16 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(206,17,38,0.5)] border-2 border-slate-800">
                <Bandera pais="Canadá" fill />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Canadá</span>
            </div>
            <div className="flex flex-col items-center gap-2 transform z-10 hover:scale-110 transition-transform">
              <div className="w-20 h-14 md:w-28 md:h-20 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(0,40,104,0.6)] border-2 border-slate-800">
                <Bandera pais="Estados Unidos" fill />
              </div>
              <span className="text-[12px] font-black uppercase tracking-widest text-white">EE.UU.</span>
            </div>
            <div className="flex flex-col items-center gap-2 transform rotate-6 hover:scale-110 transition-transform">
              <div className="w-16 h-12 md:w-24 md:h-16 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,104,71,0.5)] border-2 border-slate-800">
                <Bandera pais="México" fill />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">México</span>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 mb-8 animate-fade-in shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-400 drop-shadow-sm">
                ASEGURA TU LUGAR EN LA HISTORIA
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-6 leading-none">
              VIVE LA PASIÓN DEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">MUNDIAL 2026</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
              La plataforma oficial para vivir la fiesta más grande del fútbol en <span className="font-bold text-white">Norteamérica</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/matches" 
                className="group relative px-8 py-4 bg-white text-black font-black italic tracking-tighter rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] w-full sm:w-auto"
              >
                VER PARTIDOS
              </Link>
              <Link 
                href="/about" 
                className="px-8 py-4 bg-transparent border-2 border-white/80 text-white font-black italic tracking-tighter rounded-xl hover:bg-white/10 transition-all w-full sm:w-auto backdrop-blur-sm"
              >
                SOBRE EL EQUIPO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CALENDARIO DINÁMICO */}
      <section id="calendario" className="py-20 bg-background transition-colors duration-500">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground">
              Próximos <span className="text-primary">Encuentros</span>
            </h2>
            <p className="text-muted mt-2 font-black uppercase tracking-widest text-[10px]">Calendario Oficial confirmado.</p>
          </div>
          <ComponenteCalendario />
        </div>
      </section>

      {/* 3. INSTRUCCIONES SINCRONIZADAS */}
      <section className="py-20 bg-card border-y border-border transition-colors duration-500">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Elige tu Partido", icon: "🗓️", desc: "Selecciona el encuentro y la sede que prefieras en nuestro calendario oficial." },
              { step: "02", title: "Completa Datos", icon: "📝", desc: "Ingresa los datos de los asistentes. Recuerda: máximo 6 entradas por persona." },
              { step: "03", title: "Pago y Ticket", icon: "🎟️", desc: "Paga de forma segura y recibe tu código QR único para ingresar al estadio." }
            ].map((item, i) => (
              <div key={i} className="relative p-10 rounded-[2.5rem] bg-background border border-border transition-all duration-500 group overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-2">
                <div className="absolute top-6 right-8 text-8xl font-black text-blue-600/10 dark:text-white/20 group-hover:text-blue-500/40 group-hover:scale-110 transition-all duration-700 select-none">
                  {item.step}
                </div>
                <div className="text-5xl mb-8 transform group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                <h3 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed mt-4 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 SECCIÓN SOBRE NOSOTROS (DISEÑO DINÁMICO) */}
      <section className="py-32 relative overflow-hidden">
        {/* Elementos Decorativos de Fondo (Rompen los recuadros) */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse delay-1000 pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-foreground uppercase mb-8 leading-[0.85]">
              LA MEJOR EXPERIENCIA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-600">
                GARANTIZADA
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto mb-16 leading-relaxed">
              Detrás de TicketAR hay un equipo de expertos obsesionados con la seguridad de tu compra. 
              Conoce a los profesionales que hacen posible que vivas la fiesta más grande del fútbol sin preocupaciones.
            </p>

            <Link 
              href="/about" 
              className="group relative inline-flex items-center justify-center px-14 py-6 font-black italic tracking-tighter text-foreground uppercase bg-background border-2 border-border rounded-full hover:border-blue-500 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <span className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
              <span className="relative z-10 flex items-center gap-4 text-lg">
                DESCUBRE SOBRE NOSOTROS
                <span className="text-2xl group-hover:translate-x-3 transition-transform duration-300">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER / CIERRE */}
      <footer className="py-20 border-t border-border/40 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 pointer-events-none"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground opacity-40 relative z-10">
          TICKETAR OFICIAL © 2026 - FIFA WORLD CUP NORTH AMERICA
        </p>
      </footer>
    </main>
  );
}

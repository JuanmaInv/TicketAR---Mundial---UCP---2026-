"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { ThemeToggle } from './ThemeToggle';
import Bandera from './Bandera';

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const enlaces = [
    { name: 'INICIO', href: '/' },
    { name: 'PARTIDOS', href: '/matches' },
    { name: 'SOBRE NOSOTROS', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'MIS ENTRADAS', href: '/my-tickets', color: 'text-blue-100' },
    { name: 'MIS DATOS', href: '/profile', color: 'text-emerald-100' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/30 bg-black transition-all duration-300 h-24">
      
      {/* 🚩 FONDO DE BANDERAS ANFITRIONAS */}
      <div className="absolute inset-0 flex opacity-90 pointer-events-none">
        <div className="flex-1 transform -skew-x-12 scale-110"><Bandera pais="MÉXICO" fill={true} /></div>
        <div className="flex-1 transform -skew-x-12 scale-110 border-x border-white/40"><Bandera pais="ESTADOS UNIDOS" fill={true} /></div>
        <div className="flex-1 transform -skew-x-12 scale-110"><Bandera pais="CANADÁ" fill={true} /></div>
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]"></div>
      </div>

      <div className="container mx-auto flex h-full items-center justify-between px-6 relative z-10">
        
        {/* LADO IZQUIERDO: LOGO */}
        <div className="flex items-center md:w-1/4">
          <Link href="/" className="flex items-center group">
            <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-105">
              TICKETAR
            </span>
          </Link>
        </div>

        {/* CENTRO: SECCIONES (Escritorio) */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center space-x-8">
            {enlaces.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-black italic tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] hover:scale-110 transition-all hover:text-white/80 ${link.color || 'text-white'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* LADO DERECHO: ACCIONES */}
        <div className="flex items-center justify-end gap-3 md:gap-6 md:w-1/4">
          <ThemeToggle />
          
          <div className="hidden sm:block">
            {isLoaded && (
              isSignedIn ? (
                <div className="bg-white/20 p-1 rounded-full backdrop-blur-md border border-white/30 shadow-lg hover:scale-110 transition-transform">
                  <UserButton />
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-white text-black px-6 py-2 rounded-lg text-xs font-black italic tracking-tighter hover:scale-105 transition-all shadow-xl"
                >
                  INGRESAR
                </Link>
              )
            )}
          </div>

          {/* BOTÓN MENÚ MÓVIL */}
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden text-white p-2 focus:outline-none"
          >
            <div className="space-y-1.5">
              <span className={`block w-8 h-1 bg-white transition-all ${menuAbierto ? 'rotate-45 translate-y-2.5' : ''}`}></span>
              <span className={`block w-8 h-1 bg-white transition-all ${menuAbierto ? 'opacity-0' : ''}`}></span>
              <span className={`block w-8 h-1 bg-white transition-all ${menuAbierto ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL (Overlay) */}
      <div className={`fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center transition-all duration-500 ${menuAbierto ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <button 
          onClick={() => setMenuAbierto(false)}
          className="absolute top-8 right-8 text-white text-4xl font-light hover:rotate-90 transition-transform"
        >
          ✕
        </button>
        <div className="flex flex-col items-center space-y-8">
          {enlaces.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMenuAbierto(false)}
              className={`text-4xl font-black italic tracking-tighter text-white hover:text-blue-500 transition-all ${link.color || 'text-white'}`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-8 border-t border-white/10 w-full flex justify-center">
             {isLoaded && !isSignedIn && (
               <Link 
                 href="/login" 
                 onClick={() => setMenuAbierto(false)}
                 className="bg-white text-black px-12 py-4 rounded-xl text-xl font-black italic tracking-tighter shadow-2xl"
               >
                 INGRESAR
               </Link>
             )}
             {isLoaded && isSignedIn && (
               <UserButton />
             )}
          </div>
        </div>
      </div>
    </nav>
  );
}

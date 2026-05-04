"use client";

import React from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { ThemeToggle } from './ThemeToggle';
import Bandera from './Bandera';

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/30 bg-black transition-all duration-300 overflow-hidden h-24">
      
      {/* 🚩 FONDO DE BANDERAS ANFITRIONAS (Intensas y Vibrantes) */}
      <div className="absolute inset-0 flex opacity-90 pointer-events-none">
        <div className="flex-1 transform -skew-x-12 scale-110"><Bandera pais="MÉXICO" fill={true} /></div>
        <div className="flex-1 transform -skew-x-12 scale-110 border-x border-white/40"><Bandera pais="ESTADOS UNIDOS" fill={true} /></div>
        <div className="flex-1 transform -skew-x-12 scale-110"><Bandera pais="CANADÁ" fill={true} /></div>
        
        {/* Capa de protección de legibilidad ultra-sutil */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]"></div>
      </div>

      <div className="container mx-auto flex h-full items-center justify-between px-6 relative z-10">
        
        {/* LADO IZQUIERDO: LOGO */}
        <div className="flex items-center w-1/4">
          <Link href="/" className="flex items-center group">
            <span className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-105">
              TICKETAR
            </span>
          </Link>
        </div>

        {/* CENTRO: SECCIONES */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center space-x-8">
            {[
              { name: 'INICIO', href: '/' },
              { name: 'PARTIDOS', href: '/matches' },
              { name: 'SOBRE NOSOTROS', href: '/about' },
              { name: 'MIS ENTRADAS', href: '/my-tickets', color: 'text-blue-100' },
              { name: 'MIS DATOS', href: '/profile', color: 'text-emerald-100' },
            ].map((link) => (
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
        <div className="flex items-center justify-end gap-6 w-1/4">
          <ThemeToggle />
          
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
      </div>
    </nav>
  );
}

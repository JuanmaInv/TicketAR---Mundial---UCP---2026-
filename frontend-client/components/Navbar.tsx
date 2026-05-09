"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { ThemeToggle } from './ThemeToggle';
import Bandera from './Bandera';

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'INICIO', href: '/' },
    { name: 'PARTIDOS', href: '/matches' },
    { name: 'SOBRE NOSOTROS', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'MIS ENTRADAS', href: '/my-tickets', color: 'text-blue-100', protected: true },
    { name: 'MIS DATOS', href: '/profile', color: 'text-emerald-100', protected: true },
  ].filter(link => !link.protected || isSignedIn);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/30 bg-black transition-all duration-300 h-24">
      
      {/* 🚩 FONDO DE BANDERAS ANFITRIONAS */}
      <div className="absolute inset-0 flex opacity-90 pointer-events-none overflow-hidden">
        <div className="flex-1 transform -skew-x-12 scale-110"><Bandera pais="MÉXICO" fill={true} /></div>
        <div className="flex-1 transform -skew-x-12 scale-110 border-x border-white/40"><Bandera pais="ESTADOS UNIDOS" fill={true} /></div>
        <div className="flex-1 transform -skew-x-12 scale-110"><Bandera pais="CANADÁ" fill={true} /></div>
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]"></div>
      </div>

      <div className="container mx-auto flex h-full items-center justify-between px-6 relative z-10">
        
        {/* LADO IZQUIERDO: LOGO */}
        <div className="flex items-center w-auto md:w-1/4">
          <Link href="/" className="flex items-center group">
            <span className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-105">
              TICKETAR
            </span>
          </Link>
        </div>

        {/* CENTRO: SECCIONES (Desktop) */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
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
        <div className="flex items-center justify-end gap-4 md:gap-6 w-auto md:w-1/4">
          <ThemeToggle />
          
          {isLoaded && (
            isSignedIn ? (
              <div className="bg-white/20 p-1 rounded-full backdrop-blur-md border border-white/30 shadow-lg hover:scale-110 transition-transform">
                <UserButton />
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-white text-black px-4 md:px-6 py-2 rounded-lg text-xs font-black italic tracking-tighter hover:scale-105 transition-all shadow-xl"
              >
                INGRESAR
              </Link>
            )
          )}

          {/* MENÚ HAMBURGUESA (Mobile) */}
          <button 
            className="md:hidden text-white ml-2 p-2 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* DROPDOWN MENU (Mobile) */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-24 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/20 z-40 shadow-2xl animate-in slide-in-from-top-5">
          <div className="flex flex-col items-center py-6 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-xl font-black italic tracking-tighter text-white ${link.color || 'text-white'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

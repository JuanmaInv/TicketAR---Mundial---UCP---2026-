import React from 'react';

export default function WorldCupLoader() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] col-span-1 xl:col-span-2">
      <div className="relative">
        {/* Glow rings for magical effect */}
        <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl animate-pulse opacity-40 scale-150"></div>
        <div className="absolute inset-0 bg-yellow-500 rounded-full blur-3xl animate-pulse opacity-20 scale-[2.5]" style={{ animationDelay: '500ms' }}></div>
        
        {/* Trophy SVG with bounce animation */}
        <div className="relative animate-bounce" style={{ animationDuration: '2s' }}>
          <img 
            src="/copa.png" 
            alt="Copa del Mundo" 
            className="w-32 h-32 object-contain drop-shadow-[0_0_25px_rgba(234,179,8,0.6)]" 
          />
        </div>
      </div>
      
      <div className="mt-12 text-center space-y-2">
        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white animate-pulse">
          Cargando <span className="text-blue-500">Tickets...</span>
        </h3>
        <p className="text-zinc-500 text-xs font-black uppercase tracking-widest animate-pulse" style={{ animationDelay: '300ms' }}>
          FIFA World Cup 2026
        </p>
      </div>
    </div>
  );
}

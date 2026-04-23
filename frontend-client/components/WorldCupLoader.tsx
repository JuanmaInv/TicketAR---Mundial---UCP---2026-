import React from 'react';

export default function WorldCupLoader() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] col-span-1 xl:col-span-2">
      <div className="relative">
        {/* Glow rings for magical effect - Tricolor FIFA 2026 */}
        <div className="absolute -top-10 -left-10 w-full h-full bg-[var(--canada-red)] rounded-full blur-3xl animate-pulse opacity-30 scale-150"></div>
        <div className="absolute top-10 -right-10 w-full h-full bg-[var(--usa-blue)] rounded-full blur-3xl animate-pulse opacity-30 scale-150" style={{ animationDelay: '300ms' }}></div>
        <div className="absolute -bottom-10 left-10 w-full h-full bg-[var(--mexico-green)] rounded-full blur-3xl animate-pulse opacity-30 scale-150" style={{ animationDelay: '600ms' }}></div>
        
        {/* Trophy with bounce animation */}
        <div className="relative animate-bounce" style={{ animationDuration: '2s' }}>
          <img 
            src="/copa.png" 
            alt="Copa del Mundo" 
            className="w-32 h-32 object-contain drop-shadow-[0_0_25px_rgba(234,179,8,0.8)] relative z-10" 
          />
        </div>
      </div>
      
      <div className="mt-16 text-center space-y-2 relative z-10">
        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 animate-pulse drop-shadow-sm">
          Cargando <span className="text-[var(--usa-blue)]">Tickets...</span>
        </h3>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse" style={{ animationDelay: '300ms' }}>
          FIFA World Cup 2026
        </p>
      </div>
    </div>
  );
}

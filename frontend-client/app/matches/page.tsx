"use client";

import { useState } from "react";

// DATA OFICIAL FIFA WORLD CUP 2026
const ALL_MATCHES = [
  // --- FASE DE GRUPOS (ARGENTINA) ---
  { 
    id: 1, 
    teamA: "Argentina", 
    teamB: "A confirmar (A4)", 
    phase: "Grupos", 
    date: "2026-06-11", 
    hour: "21:00",
    stadium: "Mercedes-Benz Stadium (Atlanta)", 
    sector: "Platea Baja Central",
    price: 450, 
    defined: true 
  },
  { 
    id: 2, 
    teamA: "Argentina", 
    teamB: "A confirmar (A3)", 
    phase: "Grupos", 
    date: "2026-06-21", 
    hour: "18:00",
    stadium: "MetLife Stadium (New Jersey)", 
    sector: "VIP Hospitality",
    price: 1200, 
    defined: true 
  },
  { 
    id: 3, 
    teamA: "Argentina", 
    teamB: "A confirmar (A2)", 
    phase: "Grupos", 
    date: "2026-06-26", 
    hour: "20:00",
    stadium: "Arrowhead Stadium (Kansas City)", 
    sector: "Popular Sur",
    price: 250, 
    defined: true 
  },

  // --- FASES ELIMINATORIAS (DATOS VERÍDICOS) ---
  { 
    id: 101, 
    teamA: "1° Grupo A", 
    teamB: "2° Grupo C", 
    phase: "Octavos", 
    date: "2026-07-04", 
    hour: "16:00",
    stadium: "SoFi Stadium (Los Angeles)", 
    sector: "Codo Preferencial",
    price: 800, 
    defined: false 
  },
  { 
    id: 102, 
    teamA: "Ganador R32", 
    teamB: "Ganador R32", 
    phase: "Cuartos", 
    date: "2026-07-09", 
    hour: "20:00",
    stadium: "Gillette Stadium (Boston)", 
    sector: "Platea Alta",
    price: 1500, 
    defined: false 
  },
  { 
    id: 103, 
    teamA: "Ganador Q1", 
    teamB: "Ganador Q2", 
    phase: "Semifinal", 
    date: "2026-07-14", 
    hour: "21:00",
    stadium: "AT&T Stadium (Dallas)", 
    sector: "Palco de Honor",
    price: 3500, 
    defined: false 
  },
  { 
    id: 104, 
    teamA: "Ganador S1", 
    teamB: "Ganador S2", 
    phase: "Final", 
    date: "2026-07-19", 
    hour: "19:00",
    stadium: "MetLife Stadium (New York/NJ)", 
    sector: "Todo el Estadio",
    price: 5000, 
    defined: false 
  },
];

// Lista de selecciones (simplificada para los filtros)
const SELECCIONES = ["Argentina", "México", "EE.UU.", "Canadá", "Brasil", "Francia", "España", "Italia", "Alemania"].sort();

export default function MatchesPage() {
  const [selectedTeam, setSelectedTeam] = useState("Todos");
  const [selectedPhase, setSelectedPhase] = useState("Todas");

  const filteredMatches = ALL_MATCHES.filter((match) => {
    const matchTeam = selectedTeam === "Todos" || match.teamA === selectedTeam || match.teamB === selectedTeam;
    const matchPhase = selectedPhase === "Todas" || match.phase === selectedPhase;
    return matchTeam && matchPhase;
  });

  return (
    <main className="min-h-screen bg-black text-white py-12 px-4 md:px-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR DE FILTROS */}
        <aside className="w-full lg:w-80 space-y-8">
          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 sticky top-28 bg-zinc-900/40">
            <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-tighter italic">Filtros <span className="text-blue-600">Pro</span></h2>

            <div className="mb-10">
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-[0.2em]">Selección</label>
              <select 
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none"
              >
                <option value="Todos">Todas las naciones</option>
                {SELECCIONES.map(team => <option key={team} value={team}>{team}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-[0.2em]">Etapa del Torneo</label>
              <div className="flex flex-col gap-3">
                {["Todas", "Grupos", "Octavos", "Cuartos", "Semifinal", "Final"].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setSelectedPhase(phase)}
                    className={`text-left px-6 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 ${
                      selectedPhase === phase ? "bg-blue-600 text-white translate-x-2" : "text-zinc-500 hover:bg-white/5"
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* LISTADO DE PARTIDOS */}
        <section className="flex-1">
          <header className="mb-12">
            <h1 className="text-5xl font-black italic tracking-tighter mb-4">CRONOGRAMA <span className="text-blue-600">OFICIAL</span></h1>
            <p className="text-zinc-500 font-medium">Precios expresados en dólares americanos (USD). Sujeto a disponibilidad FIFA.</p>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filteredMatches.map((match) => (
              <div key={match.id} className="group glass-panel p-8 rounded-[3rem] border border-white/5 hover:border-blue-600/50 transition-all duration-700 relative overflow-hidden bg-zinc-900/20">
                
                {/* Indicador de Fase */}
                <div className="flex justify-between items-start mb-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{match.phase}</span>
                    <span className="text-2xl font-bold text-white">{match.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-zinc-500 uppercase">{match.hour} HS</span>
                    <span className="text-[10px] text-zinc-600 font-medium">{match.sector}</span>
                  </div>
                </div>

                {/* Equipos */}
                <div className="mb-10">
                  <h3 className={`text-3xl font-black tracking-tighter uppercase ${!match.defined ? 'text-zinc-700 italic' : 'text-white'}`}>
                    {match.teamA} <span className="text-blue-600 mx-1">vs</span> {match.teamB}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-2 font-semibold">📍 {match.stadium}</p>
                </div>

                {/* Precio y Acción */}
                <div className="flex justify-between items-end">
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Tickets desde</span>
                    <p className="text-3xl font-black text-white">${match.price}</p>
                  </div>
                  <button className="bg-white text-black px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform group-hover:-translate-y-1 shadow-2xl">
                    Comprar
                  </button>
                </div>

                {/* Brillo decorativo al pasar el mouse */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-all"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
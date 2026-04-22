"use client";

import { useState } from "react";

// 1. TODAS LAS SELECCIONES MUNDIAL 2026 (48 equipos)
const SELECCIONES_2026 = [
  "Argentina", "Brasil", "Uruguay", "Colombia", "Ecuador", "Paraguay", 
  "EE.UU.", "México", "Canadá", "Panamá", "Costa Rica", "Jamaica",
  "España", "Francia", "Inglaterra", "Alemania", "Portugal", "Italia", "Países Bajos", "Bélgica", "Croacia",
  "Marruecos", "Senegal", "Egipto", "Nigeria", "Costa de Marfil",
  "Japón", "Corea del Sur", "Australia", "Arabia Saudita", "Irán",
  // ... se pueden seguir agregando hasta completar los 48
].sort();

// 2. MOCK DE PARTIDOS (Incluyendo los "No definidos")
const ALL_MATCHES = [
  { id: 1, teamA: "Argentina", teamB: "Argelia", phase: "Grupos", date: "2026-06-15", stadium: "Arrowhead Stadium", price: 2000, defined: true },
  { id: 2, teamA: "México", teamB: "Alemania", phase: "Grupos", date: "2026-06-16", stadium: "Estadio Azteca", price: 3500, defined: true },
  // Octavos en adelante (Sin equipos definidos todavía)
  { id: 101, teamA: "1° Grupo A", teamB: "2° Grupo B", phase: "Octavos", date: "2026-06-30", stadium: "SoFi Stadium", price: 8000, defined: false },
  { id: 102, teamA: "1° Grupo C", teamB: "2° Grupo D", phase: "Cuartos", date: "2026-07-05", stadium: "MetLife Stadium", price: 15000, defined: false },
  { id: 103, teamA: "Ganador Q1", teamB: "Ganador Q2", phase: "Semifinal", date: "2026-07-10", stadium: "AT&T Stadium", price: 25000, defined: false },
  { id: 104, teamA: "Ganador S1", teamB: "Ganador S2", phase: "Final", date: "2026-07-19", stadium: "MetLife Stadium", price: 50000, defined: false },
];

export default function MatchesPage() {
  const [selectedTeam, setSelectedTeam] = useState("Todos");
  const [selectedPhase, setSelectedPhase] = useState("Todas");

  const filteredMatches = ALL_MATCHES.filter((match) => {
    const matchTeam = selectedTeam === "Todos" || match.teamA === selectedTeam || match.teamB === selectedTeam;
    const matchPhase = selectedPhase === "Todas" || match.phase === selectedPhase;
    return matchTeam && matchPhase;
  });

  return (
    <main className="min-h-screen bg-black text-white py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* BARRA LATERAL DE FILTROS */}
        <aside className="w-full md:w-72 space-y-8">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-blue-500">Filtros Avanzados</h2>

            {/* Selector de Selecciones */}
            <div className="mb-8">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">Selección participante</label>
              <select 
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              >
                <option value="Todos">Todas las selecciones</option>
                {SELECCIONES_2026.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            {/* Botonera de Fases */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">Fase del Torneo</label>
              <div className="grid grid-cols-1 gap-2">
                {["Todas", "Grupos", "Octavos", "Cuartos", "Semifinal", "Final"].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setSelectedPhase(phase)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedPhase === phase ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-zinc-400 hover:bg-white/5"
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
          <div className="mb-10">
            <h1 className="text-4xl font-bold italic mb-2">Cronograma <span className="text-blue-500">2026</span></h1>
            <p className="text-zinc-500">Explorá los encuentros de la mayor cita futbolística del mundo.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <div key={match.id} className="group glass-panel p-8 rounded-[2rem] border border-white/10 hover:border-blue-500/40 transition-all duration-500">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-tighter rounded-lg border border-white/5">
                    {match.phase}
                  </span>
                  <span className="text-zinc-500 text-xs font-medium">{match.date}</span>
                </div>

                <div className="flex flex-col gap-1 mb-8">
                  {match.defined ? (
                    <h3 className="text-2xl font-bold tracking-tight">
                      {match.teamA} <span className="text-blue-600">VS</span> {match.teamB}
                    </h3>
                  ) : (
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold tracking-tight text-zinc-600 italic">Por definir</h3>
                      <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Cruces Eliminatorios</p>
                    </div>
                  )}
                  <p className="text-zinc-500 text-sm">{match.stadium}</p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-2xl font-black text-white">${match.price}</p>
                  <button className="bg-white text-black px-8 py-3 rounded-2xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all transform group-hover:scale-105">
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
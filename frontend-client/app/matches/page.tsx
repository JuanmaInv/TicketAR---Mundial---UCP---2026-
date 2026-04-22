"use client";

import { useState } from "react";

// Mock de datos: Simulamos lo que vendría de la API del Mundial
const ALL_MATCHES = [
  { id: 1, teamA: "Argentina", teamB: "Argelia", phase: "Grupos", date: "2026-06-15", price: 2000, stadium: "Arrowhead Stadium" },
  { id: 2, teamA: "Argentina", teamB: "Austria", phase: "Grupos", date: "2026-06-20", price: 7000, stadium: "AT&T Stadium" },
  { id: 3, teamA: "Brasil", teamB: "España", phase: "Octavos", date: "2026-07-01", price: 12000, stadium: "MetLife Stadium" },
  { id: 4, teamA: "Francia", teamB: "Jordania", phase: "Grupos", date: "2026-06-18", price: 3000, stadium: "SoFi Stadium" },
  { id: 5, teamA: "Argentina", teamB: "Jordania", phase: "Grupos", date: "2026-06-25", price: 5000, stadium: "Hard Rock Stadium" },
];
export default function MatchesPage() {
  // Estados para los filtros
  const [selectedTeam, setSelectedTeam] = useState("Todos");
  const [selectedPhase, setSelectedPhase] = useState("Todas");

  // Lógica de filtrado en tiempo real
  const filteredMatches = ALL_MATCHES.filter((match) => {
    const matchTeam = selectedTeam === "Todos" || match.teamA === selectedTeam || match.teamB === selectedTeam;
    const matchPhase = selectedPhase === "Todas" || match.phase === selectedPhase;
    return matchTeam && matchPhase;
  });

  return (
    <main className="min-h-screen bg-black text-white py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR DE FILTROS */}
        <aside className="w-full md:w-64 space-y-8">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-blue-500 text-2xl">⚡</span> Filtros
            </h2>

            {/* Filtro por Selección */}
            <div className="space-y-4 mb-8">
              <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Selección</label>
              <select 
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="Todos">Todas las selecciones</option>
                <option value="Argentina">Argentina</option>
                <option value="Brasil">Brasil</option>
                <option value="Francia">Francia</option>
                <option value="España">España</option>
              </select>
            </div>

            {/* Filtro por Fase */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Fase</label>
              <div className="flex flex-col gap-2">
                {["Todas", "Grupos", "Octavos", "Cuartos"].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setSelectedPhase(phase)}
                    className={`text-left px-4 py-2 rounded-xl transition-all ${
                      selectedPhase === phase 
                      ? "bg-blue-600 text-white" 
                      : "hover:bg-white/5 text-zinc-400"
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* GRILLA DE PARTIDOS */}
        <section className="flex-1">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold italic">Próximos Partidos</h1>
              <p className="text-zinc-500">Mostrando {filteredMatches.length} encuentros disponibles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <div 
                key={match.id} 
                className="group glass-panel p-6 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                    {match.phase}
                  </span>
                  <span className="text-zinc-500 text-sm">{match.date}</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-1">
                  {match.teamA} <span className="text-blue-500">vs</span> {match.teamB}
                </h3>
                <p className="text-zinc-400 text-sm mb-6">{match.stadium}</p>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase">Desde</p>
                    <p className="text-xl font-bold text-emerald-400">${match.price}</p>
                  </div>
                  <button className="bg-white text-black font-bold px-6 py-2 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-lg">
                    Seleccionar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredMatches.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-500 text-lg">No se encontraron partidos con esos filtros. 🏟️</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

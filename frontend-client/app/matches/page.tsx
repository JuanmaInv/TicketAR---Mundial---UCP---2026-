"use client";

import { useState } from "react";

// 1. LAS 48 SELECCIONES DEL MUNDIAL 2026 (Lista completa)
const SELECCIONES_2026 = [
  "Argentina", "Brasil", "Uruguay", "Colombia", "Ecuador", "Paraguay", "Chile", "Perú",
  "EE.UU.", "México", "Canadá", "Panamá", "Costa Rica", "Jamaica", "Honduras", "El Salvador",
  "España", "Francia", "Inglaterra", "Alemania", "Portugal", "Italia", "Países Bajos", "Bélgica", "Croacia", "Dinamarca", "Suiza", "Austria",
  "Marruecos", "Senegal", "Egipto", "Nigeria", "Costa de Marfil", "Túnez", "Argelia", "Camerún",
  "Japón", "Corea del Sur", "Australia", "Arabia Saudita", "Irán", "Irak", "Uzbekistán", "Emiratos Árabes",
  "Nueva Zelanda", "Sudáfrica", "Ghana", "Polonia"
].sort();

// 2. MOCK DE PARTIDOS EDIDATO (Incluye Sector, los 3 de Argentina y cobertura total)
const ALL_MATCHES = [
  // --- ARGENTINA (3 PARTIDOS OFICIALES FASE GRUPOS) ---
  { id: 1, teamA: "Argentina", teamB: "Ecuador", phase: "Grupos", date: "2026-06-11", stadium: "Mercedes-Benz Stadium (Atlanta)", sector: "Platea Baja Central", price: 450, defined: true },
  { id: 2, teamA: "Argentina", teamB: "Polonia", phase: "Grupos", date: "2026-06-21", stadium: "MetLife Stadium (New Jersey)", sector: "VIP Hospitality", price: 1200, defined: true },
  { id: 3, teamA: "Argentina", teamB: "Argelia", phase: "Grupos", date: "2026-06-26", stadium: "Arrowhead Stadium (Kansas City)", sector: "Popular Norte", price: 250, defined: true },

  // --- RESTO DE SELECCIONES (Asegurando cobertura de las 48) ---
  { id: 4, teamA: "México", teamB: "Alemania", phase: "Grupos", date: "2026-06-11", stadium: "Estadio Azteca (CDMX)", sector: "Palco Club", price: 500, defined: true },
  { id: 5, teamA: "Canadá", teamB: "Francia", phase: "Grupos", date: "2026-06-12", stadium: "BC Place (Vancouver)", sector: "Platea Alta", price: 300, defined: true },
  { id: 6, teamA: "Brasil", teamB: "Italia", phase: "Grupos", date: "2026-06-13", stadium: "Hard Rock Stadium (Miami)", sector: "VIP Gold", price: 800, defined: true },
  { id: 7, teamA: "Uruguay", teamB: "Inglaterra", phase: "Grupos", date: "2026-06-14", stadium: "Lincoln Financial Field", sector: "Codo Superior", price: 200, defined: true },
  { id: 8, teamA: "Colombia", teamB: "España", phase: "Grupos", date: "2026-06-15", stadium: "NRG Stadium (Houston)", sector: "Platea Baja", price: 350, defined: true },
  { id: 9, teamA: "EE.UU.", teamB: "Japón", phase: "Grupos", date: "2026-06-12", stadium: "SoFi Stadium (L.A.)", sector: "Hospitality", price: 600, defined: true },
  { id: 10, teamA: "Marruecos", teamB: "Croacia", phase: "Grupos", date: "2026-06-16", stadium: "Lumen Field", sector: "General Sur", price: 150, defined: true },
  { id: 11, teamA: "Chile", teamB: "Países Bajos", phase: "Grupos", date: "2026-06-17", stadium: "Levi's Stadium", sector: "Platea Media", price: 280, defined: true },
  { id: 12, teamA: "Costa Rica", teamB: "Senegal", phase: "Grupos", date: "2026-06-18", stadium: "Estadio Monterrey", sector: "Cabecera", price: 180, defined: true },
  { id: 13, teamA: "Paraguay", teamB: "Egipto", phase: "Grupos", date: "2026-06-19", stadium: "Gillette Stadium", sector: "Platea Alta", price: 190, defined: true },
  { id: 14, teamA: "Jamaica", teamB: "Portugal", phase: "Grupos", date: "2026-06-20", stadium: "Rice-Eccles Stadium", sector: "General Norte", price: 220, defined: true },
  { id: 15, teamA: "Nigeria", teamB: "Bélgica", phase: "Grupos", date: "2026-06-22", stadium: "BMO Field", sector: "Codo Inferior", price: 240, defined: true },
  { id: 16, teamA: "Corea del Sur", teamB: "Dinamarca", phase: "Grupos", date: "2026-06-23", stadium: "AT&T Stadium", sector: "Platea Baja Central", price: 320, defined: true },
  { id: 17, teamA: "Australia", teamB: "Suiza", phase: "Grupos", date: "2026-06-24", stadium: "SoFi Stadium", sector: "Popular", price: 170, defined: true },
  { id: 18, teamA: "Ghana", teamB: "Arabia Saudita", phase: "Grupos", date: "2026-06-25", stadium: "Mercedes-Benz Stadium", sector: "Platea Alta", price: 190, defined: true },
  { id: 19, teamA: "Perú", teamB: "Irak", phase: "Grupos", date: "2026-06-18", stadium: "MetLife Stadium", sector: "Codo", price: 160, defined: true },
  { id: 20, teamA: "Irán", teamB: "Panamá", phase: "Grupos", date: "2026-06-26", stadium: "Hard Rock Stadium", sector: "Platea Baja", price: 180, defined: true },
  { id: 21, teamA: "Costa de Marfil", teamB: "Honduras", phase: "Grupos", date: "2026-06-27", stadium: "NRG Stadium", sector: "Cabecera", price: 140, defined: true },
  { id: 22, teamA: "El Salvador", teamB: "Uzbekistán", phase: "Grupos", date: "2026-06-28", stadium: "BC Place", sector: "General", price: 110, defined: true },
  { id: 23, teamA: "Camerún", teamB: "Austria", phase: "Grupos", date: "2026-06-29", stadium: "Gillette Stadium", sector: "Platea Alta", price: 210, defined: true },
  { id: 24, teamA: "Nueva Zelanda", teamB: "Sudáfrica", phase: "Grupos", date: "2026-06-15", stadium: "Lumen Field", sector: "General", price: 100, defined: true },
  { id: 25, teamA: "Túnez", teamB: "Emiratos Árabes", phase: "Grupos", date: "2026-06-20", stadium: "Mercedes-Benz Stadium", sector: "Platea Media", price: 130, defined: true },

  // --- ELIMINATORIAS (DATOS OFICIALES) ---
  { id: 101, teamA: "1° Grupo A", teamB: "2° Grupo B", phase: "Octavos", date: "2026-06-30", stadium: "SoFi Stadium (L.A.)", sector: "Platea Preferencial", price: 800, defined: false },
  { id: 102, teamA: "Ganador R32-1", teamB: "Ganador R32-2", phase: "Cuartos", date: "2026-07-09", stadium: "Gillette Stadium (Boston)", sector: "Categoría 1 Premium", price: 1500, defined: false },
  { id: 103, teamA: "Ganador Q1", teamB: "Ganador Q2", phase: "Semifinal", date: "2026-07-14", stadium: "AT&T Stadium (Dallas)", sector: "VIP Hospitality", price: 3500, defined: false },
  { id: 104, teamA: "Ganador S1", teamB: "Ganador S2", phase: "Final", date: "2026-07-19", stadium: "MetLife Stadium (NY/NJ)", sector: "Todo el Estadio", price: 5000, defined: false },
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
            <h2 className="text-xl font-bold mb-6 text-blue-500 italic uppercase">Filtros Pro</h2>

            <div className="mb-8">
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Selección</label>
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

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Etapa del Torneo</label>
              <div className="grid grid-cols-1 gap-2">
                {["Todas", "Grupos", "Octavos", "Cuartos", "Semifinal", "Final"].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setSelectedPhase(phase)}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedPhase === phase ? "bg-blue-600 text-white" : "text-zinc-500 hover:bg-white/5"
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
            <h1 className="text-4xl font-black italic mb-2 tracking-tighter uppercase">Cronograma <span className="text-blue-500">2026</span></h1>
            <p className="text-zinc-500 font-medium italic">Precios oficiales FIFA en USD.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <div key={match.id} className="group glass-panel p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-600/40 transition-all duration-500 bg-zinc-900/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                    {match.phase}
                  </span>
                  <span className="text-zinc-500 text-xs font-bold">{match.date}</span>
                </div>

                <div className="flex flex-col gap-1 mb-8">
                  {match.defined ? (
                    <h3 className="text-2xl font-black tracking-tighter uppercase">
                      {match.teamA} <span className="text-blue-600 mx-1">VS</span> {match.teamB}
                    </h3>
                  ) : (
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black tracking-tighter text-zinc-600 italic uppercase">Por definir</h3>
                      <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{match.teamA} vs {match.teamB}</p>
                    </div>
                  )}
                  <div className="mt-2">
                    <p className="text-zinc-400 text-xs font-semibold">📍 {match.stadium}</p>
                    {/* SECTOR AGREGADO AQUÍ */}
                    <p className="text-blue-500/80 text-[10px] font-black uppercase tracking-widest mt-1">Sector: {match.sector}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <p className="text-3xl font-black text-white">${match.price}</p>
                  <button className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform group-hover:scale-105 shadow-xl">
                    Comprar
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
"use client";

import { useState } from "react";

// 1. LAS 48 SELECCIONES SEGÚN EL CRONOGRAMA DE LA IMAGEN
const SELECCIONES_2026 = [
  "Argentina", "Argelia", "Austria", "Jordania", // Grupo J
  "México", "Sudáfrica", "Corea del Sur", "Republica Checa", // Grupo A
  "Canadá", "Bosnia", "Qatar", "Suiza", // Grupo B
  "Brasil", "Marruecos", "Haití", "Escocia", // Grupo C
  "EE.UU.", "Paraguay", "Australia", "Turquia", // Grupo D
  "Alemania", "Curazao", "Costa de Marfil", "Ecuador", // Grupo E
  "Holanda", "Japón", "Suecia", "Túnez", // Grupo F
  "Bélgica", "Egipto", "Irán", "Nueva Zelanda", // Grupo G
  "España", "Cabo Verde", "Arabia Saudita", "Uruguay", // Grupo H
  "Francia", "Senegal", "Irak", "Noruega", // Grupo I
  "Portugal", "RD del congo", "Uzbekistán", "Colombia", // Grupo K
  "Inglaterra", "Croacia", "Ghana", "Panamá" // Grupo L
].sort();

// 2. MOCK DE PARTIDOS SEGÚN EL CRONOGRAMA DE LA IMAGEN
const ALL_MATCHES = [
  // --- GRUPO J: EL CAMINO DE ARGENTINA (OFICIAL SEGÚN IMAGEN) ---
  { id: 1, teamA: "Argentina", teamB: "Argelia", phase: "Grupos", date: "2026-06-11", stadium: "Mercedes-Benz Stadium (Atlanta)", sector: "Platea Baja Central", price: 450, defined: true },
  { id: 2, teamA: "Argentina", teamB: "Austria", phase: "Grupos", date: "2026-06-21", stadium: "MetLife Stadium (New Jersey)", sector: "VIP Hospitality", price: 1250, defined: true },
  { id: 3, teamA: "Argentina", teamB: "Jordania", phase: "Grupos", date: "2026-06-26", stadium: "Arrowhead Stadium (Kansas City)", sector: "Popular Sur", price: 280, defined: true },

  // --- PARTIDOS DE ANFITRIONES Y OTROS GRUPOS (SEGÚN IMAGEN) ---
  { id: 4, teamA: "México", teamB: "Sudáfrica", phase: "Grupos", date: "2026-06-11", stadium: "Estadio Azteca (CDMX)", sector: "Palco Club Premier", price: 550, defined: true },
  { id: 5, teamA: "Canadá", teamB: "Qatar", phase: "Grupos", date: "2026-06-12", stadium: "BMO Field (Toronto)", sector: "Platea Baja West", price: 350, defined: true },
  { id: 6, teamA: "EE.UU.", teamB: "Paraguay", phase: "Grupos", date: "2026-06-12", stadium: "SoFi Stadium (Los Ángeles)", sector: "Main Level Corner", price: 650, defined: true },
  { id: 7, teamA: "Brasil", teamB: "Marruecos", phase: "Grupos", date: "2026-06-15", stadium: "Hard Rock Stadium (Miami)", sector: "Lower Bowl Level 1", price: 900, defined: true },
  { id: 8, teamA: "Alemania", teamB: "Ecuador", phase: "Grupos", date: "2026-06-15", stadium: "Gillette Stadium (Boston)", sector: "Platea Media", price: 380, defined: true },
  { id: 9, teamA: "Holanda", teamB: "Japón", phase: "Grupos", date: "2026-06-16", stadium: "Levi's Stadium", sector: "Categoría 1", price: 420, defined: true },
  { id: 10, teamA: "Bélgica", teamB: "Nueva Zelanda", phase: "Grupos", date: "2026-06-17", stadium: "NRG Stadium (Houston)", sector: "General Norte", price: 250, defined: true },
  { id: 11, teamA: "España", teamB: "Uruguay", phase: "Grupos", date: "2026-06-16", stadium: "Lincoln Financial Field", sector: "Codo Preferencial", price: 480, defined: true },
  { id: 12, teamA: "Francia", teamB: "Senegal", phase: "Grupos", date: "2026-06-18", stadium: "Lumen Field", sector: "Platea Alta East", price: 500, defined: true },
  { id: 13, teamA: "Portugal", teamB: "Colombia", phase: "Grupos", date: "2026-06-20", stadium: "AT&T Stadium (Dallas)", sector: "Categoría 2", price: 600, defined: true },
  { id: 14, teamA: "Inglaterra", teamB: "Croacia", phase: "Grupos", date: "2026-06-21", stadium: "MetLife Stadium", sector: "Platea Baja", price: 700, defined: true },
  
  // Asegurando el resto de selecciones de la imagen
  { id: 15, teamA: "Corea del Sur", teamB: "UEFA Playoff D", phase: "Grupos", date: "2026-06-13", stadium: "BC Place", sector: "General", price: 150, defined: true },
  { id: 16, teamA: "Suiza", teamB: "UEFA Playoff A", phase: "Grupos", date: "2026-06-14", stadium: "Arrowhead Stadium", sector: "Categoría 3", price: 180, defined: true },
  { id: 17, teamA: "Haití", teamB: "Escocia", phase: "Grupos", date: "2026-06-16", stadium: "Hard Rock Stadium", sector: "Popular", price: 120, defined: true },
  { id: 18, teamA: "Australia", teamB: "UEFA Playoff C", phase: "Grupos", date: "2026-06-17", stadium: "SoFi Stadium", sector: "General", price: 200, defined: true },
  { id: 19, teamA: "Curazao", teamB: "Costa de Marfil", phase: "Grupos", date: "2026-06-19", stadium: "NRG Stadium", sector: "Platea Alta", price: 140, defined: true },
  { id: 20, teamA: "UEFA Playoff B", teamB: "Túnez", phase: "Grupos", date: "2026-06-20", stadium: "BMO Field", sector: "General", price: 130, defined: true },
  { id: 21, teamA: "Egipto", teamB: "Irán", phase: "Grupos", date: "2026-06-22", stadium: "Gillette Stadium", sector: "Codo", price: 210, defined: true },
  { id: 22, teamA: "Cabo Verde", teamB: "Arabia Saudita", phase: "Grupos", date: "2026-06-23", stadium: "Levi's Stadium", sector: "General", price: 110, defined: true },
  { id: 23, teamA: "Intercontinental 2", teamB: "Noruega", phase: "Grupos", date: "2026-06-24", stadium: "Lumen Field", sector: "Categoría 3", price: 190, defined: true },
  { id: 24, teamA: "Intercontinental 1", teamB: "Uzbekistán", phase: "Grupos", date: "2026-06-25", stadium: "AT&T Stadium", sector: "Platea Media", price: 160, defined: true },
  { id: 25, teamA: "Ghana", teamB: "Panamá", phase: "Grupos", date: "2026-06-26", stadium: "Rice-Eccles Stadium", sector: "Popular", price: 140, defined: true },

  // --- ELIMINATORIAS (DATOS OFICIALES FIFA) ---
  { id: 101, teamA: "1° Grupo J", teamB: "2° Grupo I", phase: "Octavos", date: "2026-06-30", stadium: "SoFi Stadium (L.A.)", sector: "Platea Preferencial", price: 850, defined: false },
  { id: 102, teamA: "Ganador R32-1", teamB: "Ganador R32-2", phase: "Cuartos", date: "2026-07-09", stadium: "Gillette Stadium (Boston)", sector: "Categoría 1 Premium", price: 1600, defined: false },
  { id: 103, teamA: "Ganador Q1", teamB: "Ganador Q2", phase: "Semifinal", date: "2026-07-14", stadium: "AT&T Stadium (Dallas)", sector: "VIP Club Suite", price: 3800, defined: false },
  { id: 104, teamA: "Ganador Semi 1", teamB: "Ganador Semi 2", phase: "Final", date: "2026-07-19", stadium: "MetLife Stadium (NY/NJ)", sector: "Acceso Total Estadio", price: 6500, defined: false },
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
          <div className="glass-panel p-6 rounded-3xl border border-white/10 sticky top-24 bg-zinc-900/40">
            <h2 className="text-xl font-bold mb-6 text-blue-500 italic uppercase tracking-tighter">Filtros Avanzados</h2>

            <div className="mb-8">
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Selección</label>
              <select 
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none"
              >
                <option value="Todos">Todas las naciones</option>
                {SELECCIONES_2026.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Fase del Torneo</label>
              <div className="grid grid-cols-1 gap-2">
                {["Todas", "Grupos", "Octavos", "Cuartos", "Semifinal", "Final"].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setSelectedPhase(phase)}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
            <h1 className="text-4xl font-black italic mb-2 tracking-tighter uppercase">Cronograma <span className="text-blue-500">Oficial</span> FIFA</h1>
            <p className="text-zinc-500 font-medium italic">Sorteo final confirmado para el Mundial 2026.</p>
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
                      {match.teamA} <span className="text-blue-600 mx-1 text-xl">VS</span> {match.teamB}
                    </h3>
                  ) : (
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black tracking-tighter text-zinc-600 italic uppercase">Por definir</h3>
                      <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{match.teamA} vs {match.teamB}</p>
                    </div>
                  )}
                  <div className="mt-2">
                    <p className="text-zinc-400 text-xs font-semibold">📍 {match.stadium}</p>
                    <p className="text-blue-500/80 text-[10px] font-black uppercase tracking-widest mt-1">Sector: {match.sector}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <p className="text-3xl font-black text-white">${match.price} <span className="text-xs text-zinc-500">USD</span></p>
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
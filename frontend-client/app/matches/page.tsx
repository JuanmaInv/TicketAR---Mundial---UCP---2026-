"use client";

import { useState } from "react";

// Definimos la interfaz para que TypeScript no tire error en el renderizado
interface Match {
  id: number;
  teamA: string;
  teamB: string;
  phase: string;
  date: string;
  hour: string;
  stadium: string;
  sector: string;
  price: number;
  defined: boolean;
}

// 1. LISTA DE SELECCIONES (Sincronizada con tu cronograma)
const SELECCIONES_2026 = [
  "Argentina", "Argelia", "Austria", "Jordania",
  "México", "Sudáfrica", "Corea del Sur", "Republica checa",
  "Canadá", "Bosnia", "Qatar", "Suiza",
  "Brasil", "Marruecos", "Haití", "Escocia",
  "EE.UU.", "Paraguay", "Australia", "Turquia",
  "Alemania", "Curazao", "Costa de Marfil", "Ecuador",
  "Holanda", "Japón", "Túnez", "Bélgica",
  "Egipto", "Irán", "Nueva Zelanda", "España",
  "Cabo Verde", "Arabia Saudita", "Uruguay", "Francia",
  "Senegal", "Noruega", "Portugal", "Uzbekistán",
  "Colombia", "Inglaterra", "Croacia", "Ghana", "Panamá"
].sort();

// 2. PARTIDOS (IDs únicos y sintaxis corregida)
const ALL_MATCHES: Match[] = [
  { id: 1, teamA: "Argentina", teamB: "Argelia", phase: "Grupos", date: "2026-06-11", hour: "21:00", stadium: "Mercedes-Benz Stadium", sector: "Platea Baja", price: 450, defined: true },
  { id: 2, teamA: "Argentina", teamB: "Austria", phase: "Grupos", date: "2026-06-21", hour: "18:00", stadium: "MetLife Stadium", sector: "VIP Hospitality", price: 1250, defined: true },
  { id: 3, teamA: "Argentina", teamB: "Jordania", phase: "Grupos", date: "2026-06-26", hour: "20:00", stadium: "Arrowhead Stadium", sector: "Popular Sur", price: 280, defined: true },
  { id: 4, teamA: "México", teamB: "Sudáfrica", phase: "Grupos", date: "2026-06-11", hour: "17:00", stadium: "Estadio Azteca", sector: "Palco Club", price: 550, defined: true },
  { id: 5, teamA: "Canadá", teamB: "Qatar", phase: "Grupos", date: "2026-06-12", hour: "20:00", stadium: "BMO Field", sector: "Platea Alta", price: 350, defined: true },
  { id: 6, teamA: "EE.UU.", teamB: "Paraguay", phase: "Grupos", date: "2026-06-12", hour: "19:00", stadium: "SoFi Stadium", sector: "VIP Gold", price: 650, defined: true },
  { id: 7, teamA: "1° Grupo J", teamB: "2° Grupo I", phase: "Octavos", date: "2026-06-30", hour: "21:00", stadium: "SoFi Stadium", sector: "Preferencial", price: 850, defined: false },
  { id: 8, teamA: "Ganador S1", teamB: "Ganador S2", phase: "Final", date: "2026-07-19", hour: "19:00", stadium: "MetLife Stadium", sector: "Acceso Total", price: 6500, defined: false }
];

export default function MatchesPage() {
  const [selectedTeam, setSelectedTeam] = useState("Todos");
  const [selectedPhase, setSelectedPhase] = useState("Todas");

  const filteredMatches = ALL_MATCHES.filter((m) => {
    const matchTeam = selectedTeam === "Todos" || m.teamA === selectedTeam || m.teamB === selectedTeam;
    const matchPhase = selectedPhase === "Todas" || m.phase === selectedPhase;
    return matchTeam && matchPhase;
  });

  return (
    <main className="min-h-screen bg-black text-white py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* FILTROS */}
        <aside className="w-full md:w-72 space-y-8">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 sticky top-24 bg-zinc-900/40">
            <h2 className="text-xl font-bold mb-6 text-blue-500 italic uppercase">Filtros TicketAR</h2>
            
            <div className="mb-8">
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-3">Selección</label>
              <select 
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none appearance-none"
              >
                <option value="Todos">Todas las naciones</option>
                {SELECCIONES_2026.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-3">Fase</label>
              <div className="flex flex-col gap-2">
                {["Todas", "Grupos", "Octavos", "Final"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setSelectedPhase(p)}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedPhase === p ? "bg-blue-600 text-white" : "text-zinc-500 hover:bg-white/5"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* LISTADO */}
        <section className="flex-1">
          <header className="mb-10">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Cronograma <span className="text-blue-600">Oficial</span></h1>
            <p className="text-zinc-500 font-medium italic italic">Resultados del sorteo 2026.</p>
          </header>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <div key={match.id} className="group glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/10 hover:border-blue-600/40 transition-all duration-500">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase rounded-lg border border-white/5 italic">
                    {match.phase}
                  </span>
                  <span className="text-zinc-400 text-xs font-bold">{match.date}</span>
                </div>

                <div className="mb-8">
                  <h3 className={`text-2xl font-black tracking-tighter uppercase ${!match.defined ? 'text-zinc-700 italic' : 'text-white'}`}>
                    {match.teamA} <span className="text-blue-600 mx-1">VS</span> {match.teamB}
                  </h3>
                  <div className="mt-2">
                    <p className="text-zinc-400 text-xs font-semibold">📍 {match.stadium}</p>
                    <p className="text-blue-500/80 text-[10px] font-black uppercase mt-1 italic tracking-widest">Sector: {match.sector}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <p className="text-3xl font-black text-white">${match.price}</p>
                  <button className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform group-hover:scale-105">
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
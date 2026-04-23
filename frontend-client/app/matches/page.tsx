"use client";

import { useState, useEffect } from "react";
import Bandera from "@/components/Bandera";
import WorldCupLoader from "@/components/WorldCupLoader";
import SkeletonMatchCard from "@/components/SkeletonMatchCard";

// 1. LAS 48 SELECCIONES SEGÚN EL CRONOGRAMA DE LA IMAGEN
const SELECCIONES_2026 = [
  "Alemania", "Arabia Saudí", "Argelia", "Argentina", "Australia",
  "Austria", "Bosnia y Herzegovina", "Brasil", "Bélgica", "Cabo Verde",
  "Canadá", "Colombia", "Corea del Sur", "Costa de Marfil", "Croacia",
  "Curazao", "Ecuador", "Egipto", "Escocia", "España", "Estados Unidos",
  "Francia", "Ghana", "Haití", "Inglaterra", "Irak", "Irán", "Japón",
  "Jordania", "Marruecos", "México", "Noruega", "Nueva Zelanda",
  "Panamá", "Paraguay", "Países Bajos", "Portugal", "Qatar", "RD Congo",
  "República Checa", "Senegal", "Sudáfrica", "Suecia", "Suiza",
  "Turquía", "Túnez", "Uruguay", "Uzbekistán"
];

// 2. MOCK DE PARTIDOS SEGÚN EL CRONOGRAMA DE LA IMAGEN
const ALL_MATCHES = [
  // --- GRUPO J: EL CAMINO DE ARGENTINA (OFICIAL SEGÚN IMAGEN) ---
  { id: 1, teamA: "Argentina", teamB: "Argelia", phase: "Grupos", date: "2026-06-11", stadium: "Mercedes-Benz Stadium (Atlanta)", sector: "Platea Baja Central", price: 450, defined: true },
  { id: 2, teamA: "Argentina", teamB: "Austria", phase: "Grupos", date: "2026-06-21", stadium: "MetLife Stadium (New Jersey)", sector: "VIP Hospitality", price: 1250, defined: true },
  { id: 3, teamA: "Argentina", teamB: "Jordania", phase: "Grupos", date: "2026-06-26", stadium: "Arrowhead Stadium (Kansas City)", sector: "Popular Sur", price: 280, defined: true },

  // --- PARTIDOS DE ANFITRIONES Y OTROS GRUPOS (SEGÚN IMAGEN) ---
  { id: 4, teamA: "México", teamB: "Sudáfrica", phase: "Grupos", date: "2026-06-11", stadium: "Estadio Azteca (CDMX)", sector: "Palco Club Premier", price: 550, defined: true },
  { id: 5, teamA: "Canadá", teamB: "Qatar", phase: "Grupos", date: "2026-06-12", stadium: "BMO Field (Toronto)", sector: "Platea Baja West", price: 350, defined: true },
  { id: 6, teamA: "Estados Unidos", teamB: "Paraguay", phase: "Grupos", date: "2026-06-12", stadium: "SoFi Stadium (Los Ángeles)", sector: "Main Level Corner", price: 650, defined: true },
  { id: 7, teamA: "Brasil", teamB: "Marruecos", phase: "Grupos", date: "2026-06-15", stadium: "Hard Rock Stadium (Miami)", sector: "Lower Bowl Level 1", price: 900, defined: true },
  { id: 8, teamA: "Alemania", teamB: "Ecuador", phase: "Grupos", date: "2026-06-15", stadium: "Gillette Stadium (Boston)", sector: "Platea Media", price: 380, defined: true },
  { id: 9, teamA: "Países Bajos", teamB: "Japón", phase: "Grupos", date: "2026-06-16", stadium: "Levi's Stadium", sector: "Categoría 1", price: 420, defined: true },
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
  { id: 22, teamA: "Cabo Verde", teamB: "Arabia Saudí", phase: "Grupos", date: "2026-06-23", stadium: "Levi's Stadium", sector: "General", price: 110, defined: true },
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
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Simulamos carga al entrar y al cambiar filtros
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsInitialLoad(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [selectedTeam, selectedPhase]);

  const filteredMatches = ALL_MATCHES.filter((match) => {
    const matchTeam = selectedTeam === "Todos" || match.teamA === selectedTeam || match.teamB === selectedTeam;
    const matchPhase = selectedPhase === "Todas" || match.phase === selectedPhase;
    return matchTeam && matchPhase;
  });

  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-900 dark:text-slate-100 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">

        {/* BARRA LATERAL DE FILTROS */}
        <aside className="w-full md:w-72 space-y-8">
          <div className="glass-panel p-6 rounded-3xl border border-gray-200 dark:border-slate-800 sticky top-24 bg-white/60 dark:bg-slate-900/60">
            <h2 className="text-xl font-bold mb-6 text-[var(--usa-blue)] italic uppercase tracking-tighter">Filtros Avanzados</h2>

            <div className="mb-8">
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-widest">Selección</label>
              <select
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--canada-red)] outline-none transition-all appearance-none text-slate-900 dark:text-white"
              >
                <option value="Todos">Todas las naciones</option>
                {SELECCIONES_2026.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-widest">Fase del Torneo</label>
              <div className="grid grid-cols-1 gap-2">
                {["Todas", "Grupos", "Octavos", "Cuartos", "Semifinal", "Final"].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setSelectedPhase(phase)}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedPhase === phase ? "bg-[var(--usa-blue)] text-white shadow-[0_0_15px_rgba(0,43,127,0.3)]" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
            <h1 className="text-4xl font-black italic mb-2 tracking-tighter uppercase text-slate-900 dark:text-white">Cronograma <span className="text-[var(--usa-blue)]">Oficial</span> FIFA</h1>
            <p className="text-slate-600 dark:text-slate-300 font-medium italic">Sorteo final confirmado para el Mundial 2026.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {isLoading ? (
              isInitialLoad ? (
                <WorldCupLoader />
              ) : (
                <>
                  <SkeletonMatchCard />
                  <SkeletonMatchCard />
                  <SkeletonMatchCard />
                  <SkeletonMatchCard />
                </>
              )
            ) : filteredMatches.map((match) => (
              <div key={match.id} className="group relative overflow-hidden glass-panel p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 hover:border-[var(--canada-red)] dark:hover:border-[var(--canada-red)] transition-all duration-500 bg-white dark:bg-slate-900">

                {/* ANIMATED HOVER BACKGROUND FLAGS */}
                {match.defined && (
                  <div className="absolute inset-0 z-0 flex opacity-0 group-hover:opacity-60 transition-all duration-700 pointer-events-none scale-110 group-hover:scale-100">
                    <div className="w-1/2 h-full">
                      <Bandera pais={match.teamA} fill />
                    </div>
                    <div className="w-1/2 h-full">
                      <Bandera pais={match.teamB} fill />
                    </div>
                    {/* Gradient overlays to smooth the flags and keep text readable */}
                    {/* El gradiente oscuro para asegurar que el texto sea legible cuando aparecen las banderas */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-white/80 dark:via-slate-900/80 to-white/90 dark:to-slate-900/90" />
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-200 dark:border-slate-700">
                      {match.phase}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">{match.date}</span>
                  </div>

                  <div className="flex flex-col gap-1 mb-8">
                    {match.defined ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                        <div className="flex items-center gap-3">
                          <Bandera pais={match.teamA} />
                          <h3 className="text-xl lg:text-2xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white group-hover:drop-shadow-md">{match.teamA}</h3>
                        </div>
                        <span className="text-[var(--gold)] text-lg lg:text-xl font-black italic leading-none">VS</span>
                        <div className="flex items-center gap-3">
                          <Bandera pais={match.teamB} />
                          <h3 className="text-xl lg:text-2xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white group-hover:drop-shadow-md">{match.teamB}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black tracking-tighter text-slate-400 dark:text-slate-500 italic uppercase">Por definir</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-[var(--usa-blue)] font-black uppercase tracking-widest">{match.teamA} vs {match.teamB}</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-2">
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold">📍 {match.stadium}</p>
                      <p className="text-[var(--mexico-green)] text-[10px] font-black uppercase tracking-widest mt-1">Sector: {match.sector}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-slate-800">
                    <p className="text-3xl font-black text-slate-900 dark:text-white">${match.price} <span className="text-xs text-slate-500 dark:text-slate-400">USD</span></p>
                    <button className="bg-[var(--usa-blue)] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 transition-all transform group-hover:scale-105 shadow-lg shadow-blue-900/20">
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
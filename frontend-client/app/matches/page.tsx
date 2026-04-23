"use client";

import { useState, useEffect } from "react";
import Bandera from "@/components/Bandera";
import WorldCupLoader from "@/components/WorldCupLoader";
import SkeletonMatchCard from "@/components/SkeletonMatchCard";

import { getPartidos } from "@/lib/api";
import { Partido } from "@/types/ticket";

// 1. LAS 48 SELECCIONES (Para el filtro lateral)
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

// 2. MOCK DE PARTIDOS (ELIMINADO - AHORA USAMOS LA API)

export default function MatchesPage() {
  // --- ESTADOS PARA LA INTEGRACIÓN CON EL BACKEND ---
  const [partidos, setPartidos] = useState<Partido[]>([]); // Almacena los partidos reales
  const [error, setError] = useState<string | null>(null); // Manejo de errores de conexión
  
  const [selectedTeam, setSelectedTeam] = useState("Todos");
  const [selectedPhase, setSelectedPhase] = useState("Todas");
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // --- CARGA DE DATOS REALES DESDE EL BACKEND (PUERTO 3000) ---
  useEffect(() => {
    async function fetchPartidos() {
      try {
        setIsLoading(true);
        const data = await getPartidos(); // Llamada a la API estandarizada
        setPartidos(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("No se pudieron cargar los partidos. Verifica que el backend esté corriendo.");
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    }
    fetchPartidos();
  }, []);

  // FILTRADO DINÁMICO (Usando los campos en español y snake_case)
  const filteredMatches = partidos.filter((match) => {
    const matchTeam = selectedTeam === "Todos" || match.equipo_local === selectedTeam || match.equipo_visitante === selectedTeam;
    const matchPhase = selectedPhase === "Todas" || match.fase === selectedPhase;
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

          {error && (
            <div className="p-6 border border-red-500/50 bg-red-500/10 rounded-3xl text-red-400 text-sm font-bold italic mb-6">
              ⚠️ {error}
            </div>
          )}

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
              <div key={match.id} className="group relative overflow-hidden glass-panel p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-600/40 transition-all duration-500 bg-zinc-900/10">
                
                {/* ANIMATED HOVER BACKGROUND FLAGS */}
                <div className="absolute inset-0 z-0 flex opacity-0 group-hover:opacity-60 transition-all duration-700 pointer-events-none scale-110 group-hover:scale-100">
                  <div className="w-1/2 h-full">
                    <Bandera pais={match.equipo_local} fill />
                  </div>
                  <div className="w-1/2 h-full">
                    <Bandera pais={match.equipo_visitante} fill />
                  </div>
                  {/* Gradient overlays to smooth the flags and keep text readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                      {match.fase}
                    </span>
                    <span className="text-zinc-500 text-xs font-bold">{new Date(match.fecha_partido).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-col gap-1 mb-8">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                      <div className="flex items-center gap-3">
                        <Bandera pais={match.equipo_local} />
                        <h3 className="text-xl lg:text-2xl font-black tracking-tighter uppercase leading-none">{match.equipo_local}</h3>
                      </div>
                      <span className="text-blue-600 text-lg lg:text-xl font-black italic leading-none">VS</span>
                      <div className="flex items-center gap-3">
                        <Bandera pais={match.equipo_visitante} />
                        <h3 className="text-xl lg:text-2xl font-black tracking-tighter uppercase leading-none">{match.equipo_visitante}</h3>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-zinc-400 text-xs font-semibold">📍 {match.nombre_estadio}</p>
                      <p className="text-blue-500/80 text-[10px] font-black uppercase tracking-widest mt-1">Estado: {match.estado}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-white/5">
                    <p className="text-3xl font-black text-white">${match.precio_base} <span className="text-xs text-zinc-500">USD</span></p>
                    <button className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform group-hover:scale-105 shadow-xl">
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
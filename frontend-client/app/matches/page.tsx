'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import WorldCupLoader from "@/components/WorldCupLoader";
import Bandera from "@/components/Bandera";
import { getPartidos, getSectores, formatPrice, Sector } from "@/lib/api";
import { Partido } from "@/types/ticket";

const SELECCIONES_FIFA = [
  "Argentina", "Brasil", "Uruguay", "Colombia", "Ecuador", "Chile", "Paraguay", "Perú",
  "México", "USA", "Canadá", "Haití", "Curazao", "Panamá", "Costa Rica",
  "Francia", "España", "Alemania", "Inglaterra", "Escocia", "Italia", "Portugal", "Holanda", "Bélgica", "Croacia", "Noruega", "Suiza", "Austria",
  "Marruecos", "Senegal", "Nigeria", "Egipto", "Argelia", "Sudáfrica", "Cabo Verde", "Ghana", "Túnez",
  "Japón", "Corea del Sur", "Australia", "Arabia Saudí", "Qatar", "Jordania", "Uzbekistán", "Irán", "Nueva Zelanda"
].sort();

const FASES = ["Todas", "Grupos", "Octavos", "Cuartos", "Semifinal", "Final"];

export default function MatchesPage() {
  const { user } = useUser();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [cargando, setCargando] = useState(true);
  
  const [filtroSeleccion, setFiltroSeleccion] = useState<string>("");
  const [faseSeleccionada, setFaseSeleccionada] = useState<string>("Todas");
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [dataPartidos, dataSectores] = await Promise.all([getPartidos(), getSectores()]);
        setPartidos(dataPartidos);
        setSectores(dataSectores);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  function getPrecioReal(matchId: string, precioBase: number) {
    const sectoresValidos = sectores.filter(s => {
       const n = s.nombre.toLowerCase();
       return (n.includes('palco') || n.includes('platea') || n.includes('popular')) && s.precio > 0;
    });
    if (sectoresValidos.length > 0) {
      const precios = sectoresValidos.map(s => s.precio);
      const minPrecio = Math.min(...precios);
      if (precioBase < 1000) return minPrecio;
    }
    return precioBase;
  };

  function normalizeTeamLabel(label: string) {
    if (!label) return "TBD";
    return label.replace(/_/g, " ").toUpperCase();
  };

  function isMatchSoldOut() {
    // Si no hay sectores cargados, no asumimos agotado
    if (sectores.length === 0) return false;
    
    // Filtramos sectores de venta (Palco, Platea, Popular)
    // Nota: Como el API actual no filtra por matchId, esta es una lógica simplificada
    const sectoresVenta = sectores.filter(s => {
      const n = s.nombre.toLowerCase();
      return n.includes('palco') || n.includes('platea') || n.includes('popular');
    });

    // Si todos los sectores de venta tienen capacidad 0, está agotado
    return sectoresVenta.length > 0 && sectoresVenta.every(s => s.capacidadDisponible <= 0);
  };

    const filteredPartidos = partidos.filter((p) => {
    const local = p.equipoLocal.toLowerCase();
    const visitante = p.equipoVisitante.toLowerCase();
    const filtro = filtroSeleccion.toLowerCase();
    
    const matchFiltro = !filtroSeleccion || local.includes(filtro) || visitante.includes(filtro);
    const matchFase = faseSeleccionada === "Todas" || p.fase === faseSeleccionada;
    return matchFiltro && matchFase;
  });

  if (cargando) return <WorldCupLoader />;

  return (
    <main className="min-h-screen py-16 px-6 bg-background text-foreground transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* FILTROS */}
        <aside className="lg:w-[340px] shrink-0">
          <div className="bg-card rounded-[2.5rem] p-10 shadow-2xl sticky top-28 border border-border">
             <h2 className="text-xl font-black italic uppercase text-primary mb-10 tracking-tight">
               Filtros <span className="text-foreground">Avanzados</span>
             </h2>
             
             <div className="mb-12 relative">
                <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4 block">Selección Nacional</label>
                <button 
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  className="w-full bg-background hover:bg-card text-foreground text-left px-6 py-4 rounded-xl text-sm font-bold transition-all flex justify-between items-center border border-border"
                >
                  <span className="truncate">{filtroSeleccion || "Todas las naciones"}</span>
                  <span className={`text-primary transition-transform duration-300 ${menuAbierto ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {menuAbierto && (
                  <>
                    {/* Backdrop para cerrar al hacer click fuera y asegurar que nada interfiera */}
                    <div className="fixed inset-0 z-[90]" onClick={() => setMenuAbierto(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] max-h-[350px] overflow-y-auto z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                      <button 
                        onClick={() => { setFiltroSeleccion(""); setMenuAbierto(false); }}
                        className="w-full text-left px-6 py-4 text-xs font-black uppercase text-blue-600 dark:text-primary hover:bg-slate-50 dark:hover:bg-white/5 transition-all border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-slate-900 z-10"
                      >
                        🌍 Todas las naciones
                      </button>
                      {SELECCIONES_FIFA.map(s => (
                        <button 
                          key={s} 
                          onClick={() => { setFiltroSeleccion(s); setMenuAbierto(false); }}
                          className="w-full text-left px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all border-b border-slate-100 dark:border-white/5 last:border-0"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                )}
             </div>

             <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4 block">Fase del Torneo</label>
                <div className="space-y-2">
                  {FASES.map(fase => (
                    <button 
                      key={fase} 
                      onClick={() => setFaseSeleccionada(fase)}
                      className={`w-full text-left px-6 py-3.5 rounded-xl text-xs font-black transition-all border-2 ${
                        faseSeleccionada === fase 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-[0_10px_20px_rgba(37,99,235,0.3)] scale-105' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 border-slate-100 dark:border-white/5 hover:border-blue-200'
                      }`}
                    >
                      {fase}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </aside>

        {/* CRONOGRAMA */}
        <section className="flex-1">
          <div className="mb-12">
            <h1 className="text-5xl font-black italic text-foreground uppercase tracking-tighter">
              Cronograma <span className="text-primary">Oficial FIFA</span>
            </h1>
          </div>

          <div className="space-y-12">
            {filteredPartidos.map((partido) => {
              const precio = getPrecioReal(partido.id, partido.precioBase);
              const local = normalizeTeamLabel(partido.equipoLocal);
              const visitante = normalizeTeamLabel(partido.equipoVisitante);

              return (
                /* BORDE DINÁMICO APLICADO AQUÍ */
                <div key={partido.id} className="world-cup-border rounded-[3.5rem] p-[3px]">
                  <div className="group relative bg-card rounded-[3.4rem] overflow-hidden transition-all duration-500 min-h-[350px] flex flex-col md:flex-row shadow-2xl">
                    
                    {/* 🚩 ANIMACIÓN DE REVELADO: Banderas aparecen al Hover */}
                    <div className="absolute inset-0 flex opacity-0 group-hover:opacity-30 pointer-events-none transition-all duration-700 transform scale-110 group-hover:scale-100">
                      <div className="w-1/2 h-full overflow-hidden border-r border-white/10">
                        <Bandera pais={local} fill={true} className="object-cover" />
                      </div>
                      <div className="w-1/2 h-full overflow-hidden">
                        <Bandera pais={visitante} fill={true} className="object-cover" />
                      </div>
                      {/* Degradado para fundir con el color de la tarjeta */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-card/40"></div>
                    </div>

                    <div className="p-12 relative z-10 w-full flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-8">
                        <span className="bg-primary/10 text-primary px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors">
                          Mundial 2026 • {partido.fase}
                        </span>
                        <span className="text-muted text-xs font-bold uppercase italic tracking-widest">10 / JUN / 2026</span>
                      </div>

                      <div className="flex flex-col lg:flex-row items-center justify-center gap-16 mb-12">
                        <div className="flex flex-col items-center gap-4 flex-1">
                          <Bandera pais={local} className="w-28 h-20 rounded-2xl shadow-2xl transition-transform hover:scale-110" />
                          <h3 className="text-4xl font-black text-foreground italic tracking-tight text-center">{local}</h3>
                        </div>
                        
                        <div className="flex flex-col items-center">
                           <span className="text-primary font-black italic text-5xl opacity-30">VS</span>
                        </div>

                        <div className="flex flex-col items-center gap-4 flex-1">
                          <Bandera pais={visitante} className="w-28 h-20 rounded-2xl shadow-2xl transition-transform hover:scale-110" />
                          <h3 className="text-4xl font-black text-foreground italic tracking-tight text-center">{visitante}</h3>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row justify-between items-center pt-10 border-t border-border gap-8">
                        <div className="flex flex-col gap-2">
                          <p className="text-foreground font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="text-xl">📍</span> {partido.nombreEstadio}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse"></div>
                            <p className="text-success text-[10px] font-black uppercase tracking-widest italic">{partido.estado}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                          <div className="text-center sm:text-right">
                            <p className="text-muted text-[9px] font-black uppercase tracking-widest mb-1">Tickets desde</p>
                            <p className="text-4xl md:text-5xl font-black text-foreground tracking-tighter transition-colors">
                              {formatPrice(precio)}
                            </p>
                          </div>
                          {isMatchSoldOut() ? (
                            <div className="bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-10 md:px-14 py-4 md:py-5 text-xs font-black uppercase tracking-widest rounded-xl cursor-not-allowed">
                              AGOTADO
                            </div>
                          ) : (
                            <Link 
                              href={user ? `/profile?partidoId=${partido.id}` : "/login"} 
                              className="relative group/btn overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white px-10 md:px-14 py-4 md:py-5 text-xs font-black uppercase tracking-widest rounded-xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 w-full sm:w-auto text-center"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></span>
                              COMPRAR AHORA
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
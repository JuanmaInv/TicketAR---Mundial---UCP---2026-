'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import WorldCupLoader from "@/components/WorldCupLoader";
import Bandera from "@/components/Bandera";
import {
  actualizarPartidoAdmin,
  actualizarSectorPartidoAdmin,
  esRolAdmin,
  formatPrice,
  getPartidos,
  getSectores,
  getUsuario,
  Sector,
} from "@/lib/api";
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
  const { user, isLoaded } = useUser();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [sectoresPorPartido, setSectoresPorPartido] = useState<
    Map<string, Sector[]>
  >(new Map());
  const [disponibilidad, setDisponibilidad] = useState<
    Map<string, number | null | undefined>
  >(new Map());
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState("");
  
  const [filtroSeleccion, setFiltroSeleccion] = useState<string>("");
  const [faseSeleccionada, setFaseSeleccionada] = useState<string>("Todas");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [partidoEditando, setPartidoEditando] = useState<Partido | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [mensajeErrorEdicion, setMensajeErrorEdicion] = useState('');
  const [formEdicion, setFormEdicion] = useState({
    fechaPartido: '',
    precioBase: '',
    fase: '',
  });
  const [sectoresEdicion, setSectoresEdicion] = useState<
    Array<{ id: string; nombre: string; precio: string; capacidadDisponible: string }>
  >([]);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [dataPartidos, dataSectores] = await Promise.all([getPartidos(), getSectores()]);
        const datosPartidos = await Promise.all(
          dataPartidos.map(async (partido) => {
            try {
              const sectoresPartido = await getSectores(partido.id);
              const disponibles = sectoresPartido.reduce(
                (total, sector) => total + Math.max(0, sector.capacidadDisponible || 0),
                0,
              );
              return [partido.id, disponibles, sectoresPartido] as const;
            } catch {
              return [partido.id, null, [] as Sector[]] as const;
            }
          }),
        );
        const disponibilidadPorPartido = new Map(
          datosPartidos.map(([id, disponibles]) => [id, disponibles]),
        );
        const sectoresMap = new Map(
          datosPartidos.map(([id, , sectoresPartido]) => [id, sectoresPartido]),
        );
        setPartidos(dataPartidos);
        setSectores(dataSectores);
        setDisponibilidad(disponibilidadPorPartido);
        setSectoresPorPartido(sectoresMap);
      } catch {
        setMensajeError("No pudimos cargar los partidos. Intentá nuevamente en unos minutos.");
      } finally {
        setCargando(false);
      }
    }
    void cargarDatos();
  }, []);

  useEffect(() => {
    async function cargarRol() {
      if (!isLoaded || !user?.emailAddresses[0]?.emailAddress) return;
      try {
        const perfil = await getUsuario(user.emailAddresses[0].emailAddress, {
          userId: user.id,
          userEmail: user.emailAddresses[0].emailAddress,
        });
        setEsAdmin(esRolAdmin(perfil?.rol));
      } catch {
        setEsAdmin(false);
      }
    }
    void cargarRol();
  }, [isLoaded, user]);

  function getPrecioReal(matchId: string, precioBase: number): number {
    const sectoresDelPartido = sectoresPorPartido.get(matchId) ?? sectores;
    const sectoresValidos = sectoresDelPartido.filter(s => {
       const n = s.nombre.toLowerCase();
       return (n.includes('palco') || n.includes('platea') || n.includes('popular')) && s.precio > 0;
    });
    if (sectoresValidos.length > 0) {
      const precios = sectoresValidos.map(s => s.precio);
      const minPrecio = Math.min(...precios);
      if (precioBase < 1000) return minPrecio;
    }
    return precioBase;
  }

  function normalizeTeamLabel(label: string): string {
    if (!label) return "TBD";
    return label.replace(/_/g, " ").toUpperCase();
  }

  const filteredPartidos = partidos.filter((p) => {
    const local = p.equipo_local.toLowerCase();
    const visitante = p.equipo_visitante.toLowerCase();
    const filtro = filtroSeleccion.toLowerCase();
    
    const matchFiltro = !filtroSeleccion || local.includes(filtro) || visitante.includes(filtro);
    const matchFase = faseSeleccionada === "Todas" || p.fase === faseSeleccionada;
    return matchFiltro && matchFase;
  });

  function abrirEdicion(partido: Partido) {
    const fechaValida = new Date(partido.fecha_partido ?? '');
    const fechaLocal = Number.isNaN(fechaValida.getTime())
      ? ''
      : new Date(fechaValida.getTime() - fechaValida.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
    setPartidoEditando(partido);
    setFormEdicion({
      fechaPartido: fechaLocal,
      precioBase: String(partido.precio_base ?? ''),
      fase: partido.fase ?? '',
    });
    const sectoresDelPartido = sectoresPorPartido.get(partido.id) ?? [];
    setSectoresEdicion(
      sectoresDelPartido.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        precio: String(s.precio ?? 0),
        capacidadDisponible: String(s.capacidadDisponible ?? 0),
      })),
    );
    setMensajeError('');
    setMensajeErrorEdicion('');
  }

  async function guardarEdicionPartido() {
    if (!partidoEditando || !user?.emailAddresses[0]?.emailAddress) return;
    setGuardandoEdicion(true);
    setMensajeError('');
    setMensajeErrorEdicion('');

    try {
      const precio = Number(formEdicion.precioBase);
      if (!Number.isFinite(precio) || precio <= 0) {
        throw new Error('El precio base debe ser un numero mayor a 0.');
      }
      if (!formEdicion.fechaPartido) {
        throw new Error('La fecha del partido es obligatoria.');
      }
      const fechaIso = new Date(formEdicion.fechaPartido).toISOString();

      await actualizarPartidoAdmin(
        partidoEditando.id,
        {
          fechaPartido: fechaIso,
          precioBase: precio,
          fase: formEdicion.fase,
        },
        {
          userId: user.id,
          userEmail: user.emailAddresses[0].emailAddress,
        },
      );

      for (const sector of sectoresEdicion) {
        const precioSector = Number(sector.precio);
        const capacidadSector = Number(sector.capacidadDisponible);

        if (!Number.isFinite(precioSector) || precioSector < 0) {
          throw new Error(
            `Precio invalido para el sector ${sector.nombre}.`,
          );
        }
        if (!Number.isFinite(capacidadSector) || capacidadSector < 0) {
          throw new Error(
            `Cantidad invalida para el sector ${sector.nombre}.`,
          );
        }

        await actualizarSectorPartidoAdmin(
          partidoEditando.id,
          sector.id,
          {
            precio: precioSector,
            capacidadDisponible: capacidadSector,
          },
          {
            userId: user.id,
            userEmail: user.emailAddresses[0].emailAddress,
          },
        );
      }

      setPartidos((prev) =>
        prev.map((p) =>
          p.id === partidoEditando.id
            ? {
                ...p,
                fecha_partido: fechaIso,
                precio_base: precio,
                fase: formEdicion.fase,
              }
            : p,
        ),
      );
      setSectoresPorPartido((prev) => {
        const siguiente = new Map(prev);
        const sectoresActuales = prev.get(partidoEditando.id) ?? [];
        const actualizados = sectoresActuales.map((s) => {
          const editado = sectoresEdicion.find((se) => se.id === s.id);
          if (!editado) return s;
          return {
            ...s,
            precio: Number(editado.precio),
            capacidadDisponible: Number(editado.capacidadDisponible),
          };
        });
        siguiente.set(partidoEditando.id, actualizados);
        return siguiente;
      });
      setPartidoEditando(null);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la edicion del partido.';
      setMensajeErrorEdicion(msg);
    } finally {
      setGuardandoEdicion(false);
    }
  }

  if (cargando) return <WorldCupLoader />;

  return (
    <main className="min-h-screen py-10 md:py-16 px-4 md:px-6 bg-background text-foreground transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 md:gap-12">
        
        {/* FILTROS */}
        <aside className="lg:w-[340px] shrink-0">
          <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl lg:sticky lg:top-28 border border-border">
             <h2 className="text-xl font-black italic uppercase text-primary mb-10 tracking-tight">
               Filtros <span className="text-foreground">Avanzados</span>
             </h2>
             
             <div className="mb-12 relative">
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4 block">Seleccion Nacional</p>
                <button type="button" onClick={() => { setMenuAbierto(!menuAbierto); }}
                  className="w-full bg-background hover:bg-card text-foreground text-left px-6 py-4 rounded-xl text-sm font-bold transition-all flex justify-between items-center border border-border"
                >
                  <span className="truncate">{filtroSeleccion || "Todas las naciones"}</span>
                  <span className={`text-primary transition-transform duration-300 ${menuAbierto ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {menuAbierto && (
                  <>
                    {/* Backdrop para cerrar al hacer click fuera y asegurar que nada interfiera */}
                    <button type="button" className="fixed inset-0 z-[90]" aria-label="Cerrar menu" onClick={() => { setMenuAbierto(false); }}></button>
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] max-h-[350px] overflow-y-auto z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                      <button type="button" onClick={() => { setFiltroSeleccion(""); setMenuAbierto(false); }}
                        className="w-full text-left px-6 py-4 text-xs font-black uppercase text-blue-600 dark:text-primary hover:bg-slate-50 dark:hover:bg-white/5 transition-all border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-slate-900 z-10"
                      >
                        🌍 Todas las naciones
                      </button>
                      {SELECCIONES_FIFA.map(s => (
                        <button type="button" key={s} 
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
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4 block">Fase del Torneo</p>
                <div className="space-y-2">
                  {FASES.map(fase => (
                    <button type="button" key={fase} 
                      onClick={() => { setFaseSeleccionada(fase); }}
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
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-black italic text-foreground uppercase tracking-tighter">
              Cronograma <span className="text-primary">Oficial FIFA</span>
            </h1>
          </div>
          {mensajeError && (
            <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm font-bold text-red-500">
              {mensajeError}
            </div>
          )}

          <div className="space-y-12">
            {filteredPartidos.map((match) => {
              const precio = getPrecioReal(match.id, match.precio_base);
              const local = normalizeTeamLabel(match.equipo_local);
              const visitante = normalizeTeamLabel(match.equipo_visitante);
              const disponibles = disponibilidad.get(match.id);
              const disponibilidadDesconocida = disponibles === null || disponibles === undefined;
              const agotado = !disponibilidadDesconocida && disponibles <= 0;

              return (
                /* BORDE DINÁMICO APLICADO AQUÍ */
                <div key={match.id} className="world-cup-border rounded-[2rem] md:rounded-[3.5rem] p-[3px]">
                  <div className="group relative bg-card rounded-[1.9rem] md:rounded-[3.4rem] overflow-hidden transition-all duration-500 min-h-[350px] flex flex-col md:flex-row shadow-2xl">
                    
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

                    <div className="p-6 md:p-12 relative z-10 w-full flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 md:mb-8">
                        <span className="bg-primary/10 text-primary px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors">
                          Mundial 2026 • {match.fase}
                        </span>
                        <span className="text-muted text-xs font-bold uppercase italic tracking-widest">10 / JUN / 2026</span>
                      </div>

                      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-16 mb-8 md:mb-12">
                        <div className="flex flex-col items-center gap-4 flex-1">
                          <Bandera pais={local} className="w-28 h-20 rounded-2xl shadow-2xl transition-transform hover:scale-110" />
                          <h3 className="text-2xl md:text-4xl font-black text-foreground italic tracking-tight text-center">{local}</h3>
                        </div>
                        
                        <div className="flex flex-col items-center">
                           <span className="text-primary font-black italic text-3xl md:text-5xl opacity-30">VS</span>
                        </div>

                        <div className="flex flex-col items-center gap-4 flex-1">
                          <Bandera pais={visitante} className="w-28 h-20 rounded-2xl shadow-2xl transition-transform hover:scale-110" />
                          <h3 className="text-2xl md:text-4xl font-black text-foreground italic tracking-tight text-center">{visitante}</h3>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-6 md:pt-10 border-t border-border gap-6 md:gap-8">
                        <div className="flex flex-col gap-2">
                          <p className="text-foreground font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="text-xl">📍</span> {match.nombre_estadio}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse"></div>
                            <p className="text-success text-[10px] font-black uppercase tracking-widest italic">{match.estado}</p>
                          </div>
                        </div>

                        <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 md:gap-10">
                          <div className="text-left sm:text-right">
                            <p className="text-muted text-[9px] font-black uppercase tracking-widest mb-1">Tickets desde</p>
                            <p className="text-3xl md:text-5xl font-black text-foreground tracking-tighter transition-colors">
                              {formatPrice(precio)}
                            </p>
                          </div>
                          {esAdmin ? (
                            <button
                              type="button"
                              onClick={() => { abrirEdicion(match); }}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-8 sm:px-14 py-5 text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 text-center"
                            >
                              Editar Partido
                            </button>
                          ) : agotado ? (
                            <span className="bg-zinc-300 text-zinc-600 px-8 py-5 text-xs font-black uppercase tracking-widest rounded-xl cursor-not-allowed">
                              Entradas agotadas
                            </span>
                          ) : disponibilidadDesconocida ? (
                            <span className="bg-amber-300 text-amber-900 px-8 py-5 text-xs font-black uppercase tracking-widest rounded-xl cursor-not-allowed">
                              Disponibilidad no disponible
                            </span>
                          ) : (
                            <Link
                              href={user ? `/profile?matchId=${match.id}` : "/login"}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 sm:px-14 py-5 text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 animate-pulse-subtle text-center"
                            >
                              Comprar Ahora
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
      {partidoEditando && (
        <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-card border border-border p-6 space-y-4">
            <h2 className="text-2xl font-black italic uppercase">Editar Partido</h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              {partidoEditando.equipo_local} vs {partidoEditando.equipo_visitante}
            </p>
            {mensajeErrorEdicion && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm font-bold text-red-500">
                {mensajeErrorEdicion}
              </div>
            )}

            <div className="space-y-3">
              <label htmlFor="admin-fecha" className="block text-xs font-bold">
                Fecha
              </label>
              <input
                id="admin-fecha"
                type="datetime-local"
                value={formEdicion.fechaPartido}
                onChange={(e) => {
                  setFormEdicion((prev) => ({ ...prev, fechaPartido: e.target.value }));
                }}
                className="w-full rounded-xl border border-border bg-background px-4 py-3"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="admin-precio" className="block text-xs font-bold">
                Precio Base
              </label>
              <input
                id="admin-precio"
                type="number"
                min="1"
                value={formEdicion.precioBase}
                onChange={(e) => {
                  setFormEdicion((prev) => ({ ...prev, precioBase: e.target.value }));
                }}
                className="w-full rounded-xl border border-border bg-background px-4 py-3"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="admin-fase" className="block text-xs font-bold">
                Fase
              </label>
              <input
                id="admin-fase"
                type="text"
                value={formEdicion.fase}
                onChange={(e) => {
                  setFormEdicion((prev) => ({ ...prev, fase: e.target.value }));
                }}
                className="w-full rounded-xl border border-border bg-background px-4 py-3"
              />
            </div>

            <div className="space-y-3">
              <p className="block text-xs font-bold">Sectores (precio y cantidad)</p>
              <div className="space-y-3">
                {sectoresEdicion.map((sector, index) => (
                  <div
                    key={sector.id}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <p className="mb-2 text-xs font-black uppercase">{sector.nombre}</p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <p className="mb-1 block text-[11px] font-bold">Precio</p>
                        <input
                          type="number"
                          min="0"
                          value={sector.precio}
                          onChange={(e) => {
                            setSectoresEdicion((prev) =>
                              prev.map((item, i) =>
                                i === index
                                  ? { ...item, precio: e.target.value }
                                  : item,
                              ),
                            );
                          }}
                          className="w-full rounded-xl border border-border bg-card px-3 py-2"
                        />
                      </div>
                      <div>
                        <p className="mb-1 block text-[11px] font-bold">
                          Cantidad disponible
                        </p>
                        <input
                          type="number"
                          min="0"
                          value={sector.capacidadDisponible}
                          onChange={(e) => {
                            setSectoresEdicion((prev) =>
                              prev.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      capacidadDisponible: e.target.value,
                                    }
                                  : item,
                              ),
                            );
                          }}
                          className="w-full rounded-xl border border-border bg-card px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setPartidoEditando(null); }}
                className="w-1/2 rounded-xl bg-muted py-3 text-sm font-black uppercase"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={guardandoEdicion}
                onClick={() => {
                  void guardarEdicionPartido();
                }}
                className="w-1/2 rounded-xl bg-blue-600 py-3 text-sm font-black uppercase text-white disabled:opacity-60"
              >
                {guardandoEdicion ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}






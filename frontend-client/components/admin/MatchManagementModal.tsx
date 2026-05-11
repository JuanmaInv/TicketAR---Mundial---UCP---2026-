'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  actualizarPartidoAdmin,
  actualizarSectorPartidoAdmin,
  getSectoresPorPartido,
  SectorPorPartido,
} from '@/lib/api';
import { Partido } from '@/types/ticket';

type AuthHeaders = {
  userId: string;
  userEmail: string;
};

type MatchManagementModalProps = {
  abierto: boolean;
  partido: Partido | null;
  auth: AuthHeaders | null;
  onCerrar: () => void;
  onPartidoActualizado: (partidoId: string, cambios: Partial<Partido>) => void;
};

type EstadoPartido = 'disponible' | 'agotado' | 'cancelado';

type FormPartido = {
  equipoLocal: string;
  equipoVisitante: string;
  fechaPartido: string;
  nombreEstadio: string;
  fase: string;
  estado: EstadoPartido;
};

const ESTADOS: EstadoPartido[] = ['disponible', 'agotado', 'cancelado'];

function normalizarFechaLocal(iso: string): string {
  if (!iso) return '';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toISOString().slice(0, 16);
}

export default function MatchManagementModal({
  abierto,
  partido,
  auth,
  onCerrar,
  onPartidoActualizado,
}: MatchManagementModalProps) {
  const [formPartido, setFormPartido] = useState<FormPartido>({
    equipoLocal: '',
    equipoVisitante: '',
    fechaPartido: '',
    nombreEstadio: '',
    fase: '',
    estado: 'disponible',
  });
  const [sectores, setSectores] = useState<SectorPorPartido[]>([]);
  const [cargandoSectores, setCargandoSectores] = useState(false);
  const [guardandoPartido, setGuardandoPartido] = useState(false);
  const [guardandoSectores, setGuardandoSectores] = useState<Record<string, boolean>>({});
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const cargarSectores = useCallback(async (idPartido: string) => {
    setCargandoSectores(true);
    setMensajeError('');
    try {
      const listaSectores = await getSectoresPorPartido(idPartido);
      setSectores(listaSectores);
    } catch (error) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : 'No pudimos cargar los sectores del partido.',
      );
    } finally {
      setCargandoSectores(false);
    }
  }, []);

  useEffect(() => {
    if (!abierto || !partido) return;

    const estadoNormalizado = partido.estado?.toLowerCase();
    const estadoSeguro: EstadoPartido = ESTADOS.includes(estadoNormalizado as EstadoPartido)
      ? (estadoNormalizado as EstadoPartido)
      : 'disponible';

    setFormPartido({
      equipoLocal: partido.equipo_local,
      equipoVisitante: partido.equipo_visitante,
      fechaPartido: normalizarFechaLocal(partido.fecha_partido),
      nombreEstadio: partido.nombre_estadio,
      fase: partido.fase,
      estado: estadoSeguro,
    });
    setMensajeError('');
    setMensajeExito('');
  }, [abierto, partido]);

  useEffect(() => {
    if (!abierto || !partido) return;

    const timeoutId = setTimeout(() => {
      void cargarSectores(partido.id);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [abierto, cargarSectores, partido]);

  const puedeGuardar = useMemo(
    () => Boolean(auth?.userEmail && auth.userId && partido?.id),
    [auth, partido?.id],
  );

  function actualizarCampoPartido(campo: keyof FormPartido, valor: string) {
    setFormPartido((prev) => ({
      ...prev,
      [campo]: campo === 'estado' ? (valor as EstadoPartido) : valor,
    }));
  }

  function actualizarCampoSector(idSectorPartido: string, cambios: Partial<SectorPorPartido>) {
    setSectores((prev) =>
      prev.map((sector) =>
        sector.id === idSectorPartido
          ? {
              ...sector,
              ...cambios,
            }
          : sector,
      ),
    );
  }

  async function guardarPartido() {
    if (!partido || !auth || !puedeGuardar) {
      setMensajeError('No se pudo validar la sesion de administrador.');
      return;
    }

    if (formPartido.estado === 'cancelado') {
      const confirmado = window.confirm(
        'Estas por marcar este partido como cancelado. Queres continuar?',
      );
      if (!confirmado) return;
    }

    setGuardandoPartido(true);
    setMensajeError('');
    setMensajeExito('');

    try {
      await actualizarPartidoAdmin(
        partido.id,
        {
          equipoLocal: formPartido.equipoLocal.trim(),
          equipoVisitante: formPartido.equipoVisitante.trim(),
          fechaPartido: new Date(formPartido.fechaPartido).toISOString(),
          nombreEstadio: formPartido.nombreEstadio.trim(),
          fase: formPartido.fase.trim(),
          estado: formPartido.estado,
        },
        auth,
      );

      onPartidoActualizado(partido.id, {
        equipo_local: formPartido.equipoLocal.trim(),
        equipo_visitante: formPartido.equipoVisitante.trim(),
        fecha_partido: new Date(formPartido.fechaPartido).toISOString(),
        nombre_estadio: formPartido.nombreEstadio.trim(),
        fase: formPartido.fase.trim(),
        estado: formPartido.estado,
      });
      setMensajeExito('Partido actualizado correctamente.');
    } catch (error) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : 'No pudimos actualizar el partido.',
      );
    } finally {
      setGuardandoPartido(false);
    }
  }

  async function guardarSector(sector: SectorPorPartido) {
    if (!partido || !auth || !puedeGuardar) {
      setMensajeError('No se pudo validar la sesion de administrador.');
      return;
    }

    setGuardandoSectores((prev) => ({ ...prev, [sector.id]: true }));
    setMensajeError('');
    setMensajeExito('');

    try {
      await actualizarSectorPartidoAdmin(
        partido.id,
        sector.idSector,
        {
          precio: Number(sector.precio),
          asientosDisponibles: Number(sector.asientosDisponibles),
        },
        auth,
      );
      await cargarSectores(partido.id);
      setMensajeExito(`Sector ${sector.nombre} actualizado correctamente.`);
    } catch (error) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : `No pudimos actualizar el sector ${sector.nombre}.`,
      );
    } finally {
      setGuardandoSectores((prev) => ({ ...prev, [sector.id]: false }));
    }
  }

  if (!abierto || !partido) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-6 text-white md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Gestionar Partido
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {partido.equipo_local} vs {partido.equipo_visitante}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>

        {mensajeError && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {mensajeError}
          </div>
        )}
        {mensajeExito && (
          <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {mensajeExito}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900/70 p-4 md:p-6">
          <h3 className="mb-4 text-lg font-black uppercase tracking-wide text-blue-300">
            Datos del partido
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-bold uppercase text-slate-300">Equipo local</span>
              <input
                type="text"
                value={formPartido.equipoLocal}
                onChange={(e) => {
                  actualizarCampoPartido('equipoLocal', e.target.value);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-bold uppercase text-slate-300">Equipo visitante</span>
              <input
                type="text"
                value={formPartido.equipoVisitante}
                onChange={(e) => {
                  actualizarCampoPartido('equipoVisitante', e.target.value);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-bold uppercase text-slate-300">Fecha del partido</span>
              <input
                type="datetime-local"
                value={formPartido.fechaPartido}
                onChange={(e) => {
                  actualizarCampoPartido('fechaPartido', e.target.value);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-bold uppercase text-slate-300">Estadio</span>
              <input
                type="text"
                value={formPartido.nombreEstadio}
                onChange={(e) => {
                  actualizarCampoPartido('nombreEstadio', e.target.value);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-bold uppercase text-slate-300">Fase</span>
              <input
                type="text"
                value={formPartido.fase}
                onChange={(e) => {
                  actualizarCampoPartido('fase', e.target.value);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-bold uppercase text-slate-300">Estado</span>
              <select
                value={formPartido.estado}
                onChange={(e) => {
                  actualizarCampoPartido('estado', e.target.value);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => {
                void guardarPartido();
              }}
              disabled={!puedeGuardar || guardandoPartido}
              className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardandoPartido ? 'Guardando partido...' : 'Guardar partido'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 md:p-6">
          <h3 className="mb-4 text-lg font-black uppercase tracking-wide text-blue-300">
            Sectores del partido
          </h3>
          {cargandoSectores ? (
            <p className="text-sm text-slate-300">Cargando sectores...</p>
          ) : sectores.length === 0 ? (
            <p className="text-sm text-slate-300">No hay sectores disponibles para este partido.</p>
          ) : (
            <div className="space-y-3">
              {sectores.map((sector) => (
                <div
                  key={sector.id}
                  className="grid grid-cols-1 items-end gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-[1fr_180px_220px_180px]"
                >
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Sector</p>
                    <p className="text-base font-black">{sector.nombre}</p>
                  </div>
                  <label className="text-sm">
                    <span className="mb-1 block text-xs font-bold uppercase text-slate-300">Precio</span>
                    <input
                      type="number"
                      min={0}
                      value={sector.precio}
                      onChange={(e) =>
                        actualizarCampoSector(sector.id, {
                          precio: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-xs font-bold uppercase text-slate-300">Asientos disponibles</span>
                    <input
                      type="number"
                      min={0}
                      value={sector.asientosDisponibles}
                      onChange={(e) =>
                        actualizarCampoSector(sector.id, {
                          asientosDisponibles: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      void guardarSector(sector);
                    }}
                    disabled={!puedeGuardar || guardandoSectores[sector.id]}
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {guardandoSectores[sector.id] ? 'Guardando...' : 'Guardar sector'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import {
  DetallePartidoSectorEstado,
  DetalleSectorEstado,
  EstadisticasVentas,
  PartidoStats,
  SectorStats,
} from './interfaces/stats.interface';
import { TicketStatus } from '../common/enums/ticket-status.enum';

interface EntradaStatsRow {
  estado: TicketStatus;
  id_partido: string | null;
  id_sector: string | null;
  cantidad: number;
  precio_total: number;
}

interface ProximoPartidoRow {
  id: string;
  equipo_local: string;
  equipo_visitante: string;
}

interface PartidoSectorRow {
  asientos_disponibles: number;
  sectores_estadio:
    | {
        capacidad: number;
      }
    | {
        capacidad: number;
      }[]
    | null;
}

function obtenerCapacidadSector(
  sector:
    | {
        capacidad: number;
      }
    | {
        capacidad: number;
      }[]
    | null,
): number {
  if (!sector) return 0;
  if (Array.isArray(sector)) {
    return sector.length > 0 ? sector[0].capacidad : 0;
  }
  return sector.capacidad;
}

@Injectable()
export class StatsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerEstadisticasGenerales(): Promise<EstadisticasVentas> {
    const { data: entradas, error: errorEntradas } = await this.supabase
      .from('entradas')
      .select('estado,id_partido,id_sector,cantidad,precio_total');

    if (errorEntradas) throw errorEntradas;

    const stats: EstadisticasVentas = {
      ingresosTotales: 0,
      entradasVendidas: 0,
      entradasPendientes: 0,
      entradasCanceladas: 0,
      desglosePorSector: [],
      ventasPorPartido: [],
      detallePorPartidoSectorEstado: [],
      proximoPartidoOcupacion: {
        partido: 'N/A',
        porcentaje: 0,
      },
    };

    const sectorMap = new Map<string, SectorStats>();
    const partidoMap = new Map<string, PartidoStats>();
    const detalleMap = new Map<string, Map<string, DetalleSectorEstado>>();

    const entradasSeguras: EntradaStatsRow[] = Array.isArray(entradas)
      ? (entradas as EntradaStatsRow[])
      : [];

    const idsPartido = Array.from(
      new Set(
        entradasSeguras
          .map((entry) => entry.id_partido)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const idsSector = Array.from(
      new Set(
        entradasSeguras
          .map((entry) => entry.id_sector)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const partidosMap = new Map<string, string>();
    if (idsPartido.length > 0) {
      const { data: partidosData } = await this.supabase
        .from('partidos')
        .select('id,equipo_local,equipo_visitante')
        .in('id', idsPartido);
      if (Array.isArray(partidosData)) {
        partidosData.forEach((p) => {
          const row = p as {
            id: string;
            equipo_local: string;
            equipo_visitante: string;
          };
          partidosMap.set(
            row.id,
            `${row.equipo_local} vs ${row.equipo_visitante}`,
          );
        });
      }
    }

    const sectoresMap = new Map<string, string>();
    if (idsSector.length > 0) {
      const { data: sectoresData } = await this.supabase
        .from('sectores_estadio')
        .select('id,nombre')
        .in('id', idsSector);
      if (Array.isArray(sectoresData)) {
        sectoresData.forEach((s) => {
          const row = s as { id: string; nombre: string };
          sectoresMap.set(row.id, row.nombre);
        });
      }
    }

    entradasSeguras.forEach((entry) => {
      const cantidad = Number(entry.cantidad) || 0;
      const ingreso = Number(entry.precio_total) || 0;

      const partidoNombre = entry.id_partido
        ? (partidosMap.get(entry.id_partido) ?? 'Partido desconocido')
        : 'Partido desconocido';

      const sectorId = entry.id_sector ?? 'desconocido';
      const sectorNombre = entry.id_sector
        ? (sectoresMap.get(entry.id_sector) ?? 'Desconocido')
        : 'Desconocido';

      const partidoId = entry.id_partido ?? 'desconocido';
      if (!detalleMap.has(partidoId)) {
        detalleMap.set(partidoId, new Map<string, DetalleSectorEstado>());
      }
      const detalleSectorMap = detalleMap.get(partidoId);
      if (detalleSectorMap && !detalleSectorMap.has(sectorId)) {
        detalleSectorMap.set(sectorId, {
          idSector: sectorId,
          sector: sectorNombre,
          pagadoCantidad: 0,
          reservadoCantidad: 0,
          canceladoCantidad: 0,
          ingresosPagado: 0,
        });
      }
      const detalleSector = detalleSectorMap?.get(sectorId);

      if (entry.estado === TicketStatus.PAGADO) {
        stats.entradasVendidas += cantidad;
        stats.ingresosTotales += ingreso;
        if (detalleSector) {
          detalleSector.pagadoCantidad += cantidad;
          detalleSector.ingresosPagado += ingreso;
        }

        if (!sectorMap.has(sectorId)) {
          sectorMap.set(sectorId, {
            sector: sectorNombre,
            cantidad: 0,
            ingresos: 0,
          });
        }
        const sectorStats = sectorMap.get(sectorId);
        if (sectorStats) {
          sectorStats.cantidad += cantidad;
          sectorStats.ingresos += ingreso;
        }

        if (!partidoMap.has(partidoNombre)) {
          partidoMap.set(partidoNombre, {
            partido: partidoNombre,
            entradasVendidas: 0,
            ingresos: 0,
          });
        }
        const partidoStats = partidoMap.get(partidoNombre);
        if (partidoStats) {
          partidoStats.entradasVendidas += cantidad;
          partidoStats.ingresos += ingreso;
        }
      } else if (entry.estado === TicketStatus.RESERVADO) {
        stats.entradasPendientes += cantidad;
        if (detalleSector) {
          detalleSector.reservadoCantidad += cantidad;
        }
      } else if (entry.estado === TicketStatus.CANCELADO) {
        stats.entradasCanceladas += cantidad;
        if (detalleSector) {
          detalleSector.canceladoCantidad += cantidad;
        }
      }
    });

    stats.desglosePorSector = Array.from(sectorMap.values());
    stats.ventasPorPartido = Array.from(partidoMap.values()).sort(
      (a, b) => b.ingresos - a.ingresos,
    );
    const detallePorPartidoSectorEstado: DetallePartidoSectorEstado[] = [];
    detalleMap.forEach((sectoresMapPorPartido, idPartido) => {
      const partidoNombre =
        idPartido === 'desconocido'
          ? 'Partido desconocido'
          : (partidosMap.get(idPartido) ?? 'Partido desconocido');
      detallePorPartidoSectorEstado.push({
        idPartido,
        partido: partidoNombre,
        sectores: Array.from(sectoresMapPorPartido.values()).sort((a, b) =>
          a.sector.localeCompare(b.sector),
        ),
      });
    });
    stats.detallePorPartidoSectorEstado = detallePorPartidoSectorEstado.sort(
      (a, b) => a.partido.localeCompare(b.partido),
    );

    const { data: proximoPartido } = await this.supabase
      .from('partidos')
      .select('id, equipo_local, equipo_visitante')
      .gte('fecha_partido', new Date().toISOString())
      .order('fecha_partido', { ascending: true })
      .limit(1)
      .maybeSingle<ProximoPartidoRow>();

    if (proximoPartido) {
      const { data: sectores } = await this.supabase
        .from('partido_sectores')
        .select('asientos_disponibles, sectores_estadio(capacidad)')
        .eq('id_partido', proximoPartido.id)
        .returns<PartidoSectorRow[]>();

      if (sectores) {
        let totalCapacidad = 0;
        let totalDisponibles = 0;
        sectores.forEach((sectorRow) => {
          totalCapacidad += obtenerCapacidadSector(sectorRow.sectores_estadio);
          totalDisponibles += sectorRow.asientos_disponibles || 0;
        });

        const ocupados = totalCapacidad - totalDisponibles;
        stats.proximoPartidoOcupacion = {
          partido: `${proximoPartido.equipo_local} vs ${proximoPartido.equipo_visitante}`,
          porcentaje:
            totalCapacidad > 0 ? (ocupados / totalCapacidad) * 100 : 0,
        };
      }
    }

    return stats;
  }
}

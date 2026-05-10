import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import {
  EstadisticasVentas,
  PartidoStats,
  SectorStats,
} from './interfaces/stats.interface';
import { TicketStatus } from '../common/enums/ticket-status.enum';

interface EntradaConSector {
  estado: TicketStatus;
  id_partido: string | null;
  sectores_estadio:
    | {
        nombre: string;
        precio: number;
      }
    | {
        nombre: string;
        precio: number;
      }[]
    | null;
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

function obtenerSectorSimple(
  sector:
    | {
        nombre: string;
        precio: number;
      }
    | {
        nombre: string;
        precio: number;
      }[]
    | null,
): { nombre: string; precio: number } | null {
  if (!sector) return null;
  return Array.isArray(sector) ? (sector[0] ?? null) : sector;
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
    // 1. Obtener todas las entradas con información del sector para calcular ingresos
    // Usamos el join de Supabase: 'entradas(estado), sectores_estadio(nombre, precio)'
    const { data: entradas, error: errorEntradas } = await this.supabase.from(
      'entradas',
    ).select(`
        estado,
        id_partido,
        sectores_estadio (
          nombre,
          precio
        )
      `);

    if (errorEntradas) throw errorEntradas;

    const stats: EstadisticasVentas = {
      ingresosTotales: 0,
      entradasVendidas: 0,
      entradasPendientes: 0,
      desglosePorSector: [],
      ventasPorPartido: [],
      proximoPartidoOcupacion: {
        partido: 'N/A',
        porcentaje: 0,
      },
    };

    const sectorMap = new Map<string, SectorStats>();
    const partidoMap = new Map<string, PartidoStats>();

    const entradasSeguras: EntradaConSector[] = Array.isArray(entradas)
      ? (entradas as EntradaConSector[])
      : [];

    const idsPartido = Array.from(
      new Set(
        entradasSeguras
          .map((entry) => entry.id_partido)
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

    entradasSeguras.forEach((entry) => {
      const sector = obtenerSectorSimple(entry.sectores_estadio);
      const sectorNombre = sector?.nombre ?? 'Desconocido';
      const precio = sector?.precio ?? 0;
      const partidoNombre = entry.id_partido
        ? (partidosMap.get(entry.id_partido) ?? 'Partido desconocido')
        : 'Partido desconocido';

      if (entry.estado === TicketStatus.PAGADO) {
        stats.ingresosTotales += precio;
        stats.entradasVendidas++;

        // Actualizar desglose por sector
        if (!sectorMap.has(sectorNombre)) {
          sectorMap.set(sectorNombre, {
            sector: sectorNombre,
            cantidad: 0,
            ingresos: 0,
          });
        }
        const sectorStats = sectorMap.get(sectorNombre);
        if (sectorStats) {
          sectorStats.cantidad++;
          sectorStats.ingresos += precio;
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
          partidoStats.entradasVendidas++;
          partidoStats.ingresos += precio;
        }
      } else if (entry.estado === TicketStatus.RESERVADO) {
        stats.entradasPendientes++;
      }
    });

    stats.desglosePorSector = Array.from(sectorMap.values());
    stats.ventasPorPartido = Array.from(partidoMap.values()).sort(
      (a, b) => b.ingresos - a.ingresos,
    );

    // 2. Obtener ocupación del próximo partido
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

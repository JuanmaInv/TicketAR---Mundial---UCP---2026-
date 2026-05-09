import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { EstadisticasVentas, SectorStats } from './interfaces/stats.interface';
import { TicketStatus } from '../common/enums/ticket-status.enum';

@Injectable()
export class StatsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async obtenerEstadisticasGenerales(): Promise<EstadisticasVentas> {
    // 1. Obtener todas las entradas con información del sector para calcular ingresos
    // Usamos el join de Supabase: 'entradas(estado), sectores_estadio(nombre, precio)'
    const { data: entradas, error: errorEntradas } = await this.supabase
      .from('entradas')
      .select(`
        estado,
        sectores_estadio (
          nombre,
          precio
        ),
        partidos (
          equipo_local,
          equipo_visitante
        )
      `);

    if (errorEntradas) throw errorEntradas;

    const stats: EstadisticasVentas = {
      ingresosTotales: 0,
      entradasVendidas: 0,
      entradasPendientes: 0,
      desglosePorSector: [],
      proximoPartidoOcupacion: {
        partido: 'N/A',
        porcentaje: 0
      }
    };

    const sectorMap = new Map<string, SectorStats>();

    entradas.forEach((entry: any) => {
      const sectorNombre = entry.sectores_estadio?.nombre || 'Desconocido';
      const precio = entry.sectores_estadio?.precio || 0;

      if (entry.estado === TicketStatus.PAGADO) {
        stats.ingresosTotales += precio;
        stats.entradasVendidas++;

        // Actualizar desglose por sector
        if (!sectorMap.has(sectorNombre)) {
          sectorMap.set(sectorNombre, { sector: sectorNombre, cantidad: 0, ingresos: 0 });
        }
        const s = sectorMap.get(sectorNombre)!;
        s.cantidad++;
        s.ingresos += precio;
      } else if (entry.estado === TicketStatus.RESERVADO) {
        stats.entradasPendientes++;
      }
    });

    stats.desglosePorSector = Array.from(sectorMap.values());

    // 2. Obtener ocupación del próximo partido
    const { data: proximoPartido, error: errorPartido } = await this.supabase
      .from('partidos')
      .select('id, equipo_local, equipo_visitante')
      .gte('fecha_partido', new Date().toISOString())
      .order('fecha_partido', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (proximoPartido) {
      const { data: sectores, error: errorSectores } = await this.supabase
        .from('partido_sectores')
        .select('asientos_disponibles, sectores_estadio(capacidad)')
        .eq('id_partido', proximoPartido.id);

      if (sectores) {
        let totalCapacidad = 0;
        let totalDisponibles = 0;
        sectores.forEach((s: any) => {
          totalCapacidad += s.sectores_estadio?.capacidad || 0;
          totalDisponibles += s.asientos_disponibles || 0;
        });

        const ocupados = totalCapacidad - totalDisponibles;
        stats.proximoPartidoOcupacion = {
          partido: `${proximoPartido.equipo_local} vs ${proximoPartido.equipo_visitante}`,
          porcentaje: totalCapacidad > 0 ? (ocupados / totalCapacidad) * 100 : 0
        };
      }
    }

    return stats;
  }
}

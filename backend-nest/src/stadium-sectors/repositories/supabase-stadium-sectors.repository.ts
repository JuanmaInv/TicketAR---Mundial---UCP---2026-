import { Injectable } from '@nestjs/common';
import {
  ISectoresRepository,
  SectorPorPartido,
} from './stadium-sectors.repository.interface';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SectorEstadioEntidad } from '../entities/stadium-sector.entity';
import { CrearSectorDto } from '../dto/create-stadium-sector.dto';
import { ActualizarSectorEnPartidoDto } from '../dto/update-sector-in-match.dto';

@Injectable()
export class SupabaseSectoresRepository implements ISectoresRepository {
  private readonly TABLE_NAME = 'sectores_estadio';

  constructor(private readonly supabaseService: SupabaseService) {}

  async crear(dto: CrearSectorDto): Promise<SectorEstadioEntidad> {
    const { data, error } = (await this.supabaseService
      .getClient()
      .from(this.TABLE_NAME)
      .insert([
        {
          nombre: dto.nombre,
          capacidad: dto.capacidad,
          precio: dto.precio,
        },
      ])
      .select()
      .single()) as { data: unknown; error: { message: string } | null };

    if (error) {
      throw new Error(`Error al crear sector en Supabase: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async obtenerTodos(): Promise<SectorEstadioEntidad[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.TABLE_NAME)
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener sectores: ${error.message}`);
    }

    return data.map((item) => this.mapToEntity(item));
  }

  async obtenerUno(id: string): Promise<SectorEstadioEntidad> {
    const { data, error } = (await this.supabaseService
      .getClient()
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single()) as { data: unknown; error: { message: string } | null };

    if (error || !data) {
      throw new Error(`Sector con ID ${id} no encontrado`);
    }

    return this.mapToEntity(data);
  }

  /**
   * Obtiene los sectores disponibles para un partido específico.
   * Hace join entre partido_sectores y sectores_estadio usando la relación id_sector.
   * Retorna nombre, precio y asientos_disponibles por sector para ese partido.
   */
  async obtenerSectoresPorPartido(
    idPartido: string,
  ): Promise<SectorPorPartido[]> {
    const [sectoresData, partidoSectoresData] = await Promise.all([
      this.supabaseService.getClient().from('sectores_estadio').select('*'),
      this.supabaseService
        .getClient()
        .from('partido_sectores')
        .select('*')
        .eq('id_partido', idPartido),
    ]);

    if (sectoresData.error)
      throw new Error(
        `Error al obtener sectores de estadio: ${sectoresData.error.message}`,
      );
    if (partidoSectoresData.error)
      throw new Error(
        `Error al obtener sectores del partido ${idPartido}: ${partidoSectoresData.error.message}`,
      );

    const sectoresMap = new Map(sectoresData.data.map((s) => [s.id, s]));

    return (partidoSectoresData.data || [])
      .map((row) => {
        const sector = sectoresMap.get(row.id_sector as string);
        if (!sector || sector.activo === false) return null;

        return {
          id: row.id as string,
          idSector: row.id_sector as string,
          nombre: sector.nombre as string,
          precio: sector.precio as number,
          asientosDisponibles: Number(row.asientos_disponibles),
        };
      })
      .filter((s): s is SectorPorPartido => s !== null);
  }

  async obtenerSectoresTodosLosPartidos(): Promise<
    { idPartido: string; sectores: SectorPorPartido[] }[]
  > {
    const [sectoresData, partidoSectoresData] = await Promise.all([
      this.supabaseService.getClient().from('sectores_estadio').select('*'),
      this.supabaseService.getClient().from('partido_sectores').select('*'),
    ]);

    if (sectoresData.error)
      throw new Error(
        `Error al obtener sectores de estadio: ${sectoresData.error.message}`,
      );
    if (partidoSectoresData.error)
      throw new Error(
        `Error al obtener sectores de todos los partidos: ${partidoSectoresData.error.message}`,
      );

    const sectoresMap = new Map(sectoresData.data.map((s) => [s.id, s]));
    const map = new Map<string, SectorPorPartido[]>();

    (partidoSectoresData.data || []).forEach((row) => {
      const sector = sectoresMap.get(row.id_sector as string);

      if (sector && sector.activo !== false) {
        const idPartido = row.id_partido as string;
        const sectoresPartido = map.get(idPartido) ?? [];
        sectoresPartido.push({
          id: row.id as string,
          idSector: row.id_sector as string,
          nombre: sector.nombre as string,
          precio: sector.precio as number,
          asientosDisponibles: Number(row.asientos_disponibles),
        });
        map.set(idPartido, sectoresPartido);
      }
    });

    return Array.from(map.entries()).map(([idPartido, sectores]) => ({
      idPartido,
      sectores,
    }));
  }

  async actualizarEnPartido(
    idPartido: string,
    idSector: string,
    datos: ActualizarSectorEnPartidoDto,
  ): Promise<SectorPorPartido> {
    if (datos.precio !== undefined) {
      const { error: errorPrecio } = await this.supabaseService
        .getClient()
        .from(this.TABLE_NAME)
        .update({ precio: datos.precio })
        .eq('id', idSector);

      if (errorPrecio) {
        throw new Error(
          `Error al actualizar precio del sector: ${errorPrecio.message}`,
        );
      }
    }

    const nuevoStock = datos.asientosDisponibles ?? datos.capacidadDisponible;

    if (nuevoStock !== undefined) {
      const { error: errorDisponibilidad } = await this.supabaseService
        .getClient()
        .from('partido_sectores')
        .update({ asientos_disponibles: nuevoStock })
        .eq('id_partido', idPartido)
        .eq('id_sector', idSector);

      if (errorDisponibilidad) {
        throw new Error(
          `Error al actualizar disponibilidad del sector en el partido: ${errorDisponibilidad.message}`,
        );
      }
    }

    const sectoresActualizados =
      await this.obtenerSectoresPorPartido(idPartido);
    const sector = sectoresActualizados.find((s) => s.idSector === idSector);
    if (!sector) {
      throw new Error('Sector no encontrado para el partido indicado');
    }
    return sector;
  }

  private mapToEntity(dbData: unknown): SectorEstadioEntidad {
    const data = dbData as {
      id: string;
      nombre: string;
      capacidad: number;
      precio: number;
      activo: boolean;
      created_at: string;
      updated_at?: string;
    };

    return {
      id: data.id,
      nombre: data.nombre,
      capacidad: data.capacidad,
      precio: data.precio,
      activo: data.activo !== false, // Default true si es null
      fechaCreacion: new Date(data.created_at),
      fechaActualizacion: data.updated_at
        ? new Date(data.updated_at)
        : undefined,
    };
  }
}

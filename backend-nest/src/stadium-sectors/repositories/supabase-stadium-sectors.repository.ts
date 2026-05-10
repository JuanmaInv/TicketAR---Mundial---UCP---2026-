import { Injectable } from '@nestjs/common';
import { ISectoresRepository } from './stadium-sectors.repository.interface';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SectorEstadioEntidad } from '../entities/stadium-sector.entity';
import { CrearSectorDto } from '../dto/create-stadium-sector.dto';
import { ActualizarSectorEnPartidoDto } from '../dto/update-sector-in-match.dto';

@Injectable()
export class SupabaseSectoresRepository implements ISectoresRepository {
  private readonly TABLE_NAME = 'sectores_estadio';
  private static readonly mapearSectorDb = (
    sector: unknown,
  ): {
    id: string;
    nombre: string;
    capacidad: number;
    capacidad_disponible: number;
    precio: number;
    fecha_creacion: Date;
  } =>
    sector as {
      id: string;
      nombre: string;
      capacidad: number;
      capacidad_disponible: number;
      precio: number;
      fecha_creacion: Date;
    };

  constructor(private readonly supabaseService: SupabaseService) {}

  async crear(dto: CrearSectorDto): Promise<SectorEstadioEntidad> {
    const { data, error } = (await this.supabaseService
      .getClient()
      .from(this.TABLE_NAME)
      .insert([
        {
          nombre: dto.nombre,
          capacidad: dto.capacidad,
          capacidad_disponible: dto.capacidad,
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

  async obtenerPorPartido(idPartido: string): Promise<SectorEstadioEntidad[]> {
    const { data: disponibilidad, error: errorDisponibilidad } =
      await this.supabaseService
        .getClient()
        .from('partido_sectores')
        .select('id_sector, asientos_disponibles')
        .eq('id_partido', idPartido);

    if (errorDisponibilidad) {
      throw new Error(
        `Error al obtener disponibilidad: ${errorDisponibilidad.message}`,
      );
    }

    const filasDisponibilidad = (disponibilidad ?? []) as Array<{
      id_sector: string;
      asientos_disponibles: number;
    }>;

    if (!filasDisponibilidad.length) return [];

    const idsSectores = filasDisponibilidad.map((fila) => fila.id_sector);
    const { data: sectores, error: errorSectores } = await this.supabaseService
      .getClient()
      .from(this.TABLE_NAME)
      .select('*')
      .in('id', idsSectores);

    if (errorSectores) {
      throw new Error(
        `Error al obtener sectores de partido: ${errorSectores.message}`,
      );
    }

    const sectoresDb = (sectores ?? []).map(
      SupabaseSectoresRepository.mapearSectorDb,
    );
    const mapaSectores = new Map(
      sectoresDb.map((sector) => [sector.id, sector]),
    );

    return filasDisponibilidad
      .map((fila) => {
        const sector = mapaSectores.get(fila.id_sector);
        if (!sector) return null;
        return this.mapToEntity({
          ...sector,
          capacidad_disponible: fila.asientos_disponibles,
        });
      })
      .filter((sector): sector is SectorEstadioEntidad => sector !== null);
  }

  async actualizarEnPartido(
    idPartido: string,
    idSector: string,
    datos: ActualizarSectorEnPartidoDto,
  ): Promise<SectorEstadioEntidad> {
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

    if (datos.capacidadDisponible !== undefined) {
      const { error: errorDisponibilidad } = await this.supabaseService
        .getClient()
        .from('partido_sectores')
        .update({ asientos_disponibles: datos.capacidadDisponible })
        .eq('id_partido', idPartido)
        .eq('id_sector', idSector);

      if (errorDisponibilidad) {
        throw new Error(
          `Error al actualizar disponibilidad del sector en el partido: ${errorDisponibilidad.message}`,
        );
      }
    }

    const sectoresActualizados = await this.obtenerPorPartido(idPartido);
    const sector = sectoresActualizados.find((s) => s.id === idSector);
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
      capacidad_disponible: number;
      precio: number;
      fecha_creacion: Date;
    };

    return {
      id: data.id,
      nombre: data.nombre,
      capacidad: data.capacidad,
      capacidadDisponible: data.capacidad_disponible,
      precio: data.precio,
      fechaCreacion: data.fecha_creacion,
    };
  }
}

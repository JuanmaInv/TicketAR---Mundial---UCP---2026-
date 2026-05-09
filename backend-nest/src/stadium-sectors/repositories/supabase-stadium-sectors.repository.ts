import { Injectable } from '@nestjs/common';
import { ISectoresRepository } from './stadium-sectors.repository.interface';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SectorEstadioEntidad } from '../entities/stadium-sector.entity';
import { CrearSectorDto } from '../dto/create-stadium-sector.dto';

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
    const { data, error } = await this.supabaseService
      .getClient()
      .from('partido_sectores')
      .select('asientos_disponibles, sectores_estadio(*)')
      .eq('id_partido', idPartido);

    if (error) {
      throw new Error(`Error al obtener disponibilidad: ${error.message}`);
    }

    return data.map((item) => {
      const row = item as {
        asientos_disponibles: number;
        sectores_estadio: unknown;
      };
      return this.mapToEntity({
        ...(row.sectores_estadio as object),
        capacidad_disponible: row.asientos_disponibles,
      });
    });
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

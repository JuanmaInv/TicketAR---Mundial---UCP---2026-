import { Injectable } from '@nestjs/common';
import { IPartidosRepository } from './matches.repository.interface';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { PartidoEntidad } from '../entities/match.entity';
import { CrearPartidoDto } from '../dto/create-match.dto';

@Injectable()
export class SupabasePartidosRepository implements IPartidosRepository {
  private readonly TABLE_NAME = 'partidos';

  constructor(private readonly supabaseService: SupabaseService) {}

  async crear(crearPartidoDto: CrearPartidoDto): Promise<PartidoEntidad> {
    const { data, error } = (await this.supabaseService
      .getClient()
      .from(this.TABLE_NAME)
      .insert([
        {
          equipo_local: crearPartidoDto.equipoLocal,
          equipo_visitante: crearPartidoDto.equipoVisitante,
          fecha_partido: crearPartidoDto.fechaPartido,
          nombre_estadio: crearPartidoDto.nombreEstadio,
          fase: crearPartidoDto.fase,
          precio_base: crearPartidoDto.precioBase,
          estado: 'programado',
        },
      ])
      .select()
      .single()) as { data: unknown; error: Error | null };

    if (error) {
      throw new Error(`Error al crear partido en Supabase: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async obtenerTodos(): Promise<PartidoEntidad[]> {
    const { data, error } = (await this.supabaseService
      .getClient()
      .from(this.TABLE_NAME)
      .select('*')
      .order('fecha_partido', { ascending: true })) as {
      data: unknown[];
      error: Error | null;
    };

    if (error) {
      throw new Error(`Error al obtener partidos: ${error.message}`);
    }

    return (data || []).map((item) => this.mapToEntity(item));
  }

  async obtenerUno(id: string): Promise<PartidoEntidad> {
    const { data, error } = (await this.supabaseService
      .getClient()
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single()) as { data: unknown; error: Error | null };

    if (error || !data) {
      throw new Error(`Partido con ID ${id} no encontrado`);
    }

    return this.mapToEntity(data);
  }

  private mapToEntity(dbData: unknown): PartidoEntidad {
    const data = dbData as {
      id: string;
      equipo_local: string;
      equipo_visitante: string;
      fecha_partido: string;
      nombre_estadio: string;
      fase: string;
      precio_base: number;
      estado: string;
      fecha_creacion: string;
      fecha_actualizacion?: string;
    };

    return {
      id: data.id,
      equipoLocal: data.equipo_local,
      equipoVisitante: data.equipo_visitante,
      fechaPartido: new Date(data.fecha_partido).toISOString(),
      nombreEstadio: data.nombre_estadio,
      fase: data.fase,
      precioBase: data.precio_base,
      estado: data.estado,
      fechaCreacion: new Date(data.fecha_creacion).toISOString(),
      fechaActualizacion: new Date(
        data.fecha_actualizacion || data.fecha_creacion,
      ).toISOString(),
    };
  }
}

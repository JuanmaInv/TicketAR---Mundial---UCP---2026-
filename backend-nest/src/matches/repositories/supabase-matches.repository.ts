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
    const { data, error } = await this.supabaseService
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
      .single();

    if (error) {
      throw new Error(`Error al crear partido en Supabase: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async obtenerTodos(): Promise<PartidoEntidad[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.TABLE_NAME)
      .select('*')
      .order('fecha_partido', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener partidos: ${error.message}`);
    }

    return data.map((item) => this.mapToEntity(item));
  }

  async obtenerUno(id: string): Promise<PartidoEntidad> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(`Partido con ID ${id} no encontrado`);
    }

    return this.mapToEntity(data);
  }

  private mapToEntity(dbData: any): PartidoEntidad {
    return {
      id: dbData.id,
      equipoLocal: dbData.equipo_local,
      equipoVisitante: dbData.equipo_visitante,
      fechaPartido: new Date(dbData.fecha_partido).toISOString(),
      nombreEstadio: dbData.nombre_estadio,
      fase: dbData.fase,
      precioBase: dbData.precio_base,
      estado: dbData.estado,
      fechaCreacion: new Date(dbData.fecha_creacion).toISOString(),
      fechaActualizacion: new Date(dbData.fecha_actualizacion || dbData.fecha_creacion).toISOString(),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { IPartidosRepository } from './matches.repository.interface';
import { CrearPartidoDto } from '../dto/create-match.dto';
import { PartidoEntidad } from '../entities/match.entity';

@Injectable()
export class SupabasePartidosRepository implements IPartidosRepository {
  private readonly table = 'partidos';

  constructor(private readonly supabaseService: SupabaseService) {}

  async crear(dto: CrearPartidoDto): Promise<PartidoEntidad> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.table)
      .insert([
        {
          equipo_local: dto.equipoLocal,
          equipo_visitante: dto.equipoVisitante,
          fecha_partido: dto.fechaPartido,
          nombre_estadio: dto.nombreEstadio,
          fase: dto.fase,
          precio_base: dto.precioBase,
          estado: 'PROGRAMADO',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async obtenerTodos(): Promise<PartidoEntidad[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.table)
      .select('*');

    if (error) throw error;
    return data.map((item) => this.mapToEntity(item));
  }

  async obtenerUno(id: string): Promise<PartidoEntidad | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  private mapToEntity(data: any): PartidoEntidad {
    return {
      id: data.id,
      equipoLocal: data.equipo_local,
      equipoVisitante: data.equipo_visitante,
      fechaPartido: new Date(data.fecha_partido),
      nombreEstadio: data.nombre_estadio,
      fase: data.fase,
      precioBase: data.precio_base,
      estado: data.estado,
      fechaCreacion: new Date(data.fecha_creacion),
      fechaActualizacion: new Date(data.fecha_actualizacion || data.fecha_creacion),
    };
  }
}

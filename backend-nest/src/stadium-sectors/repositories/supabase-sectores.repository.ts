import { Injectable } from '@nestjs/common';
import { ISectoresRepository } from './sectores.repository.interface';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { CrearSectorDto } from '../dto/create-stadium-sector.dto';

@Injectable()
export class SupabaseSectoresRepository implements ISectoresRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async obtenerTodos(): Promise<any[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('sectores_estadio')
      .select('*');

    if (error) return [];
    return data;
  }

  async obtenerUno(id: string): Promise<any | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('sectores_estadio')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data;
  }

  async crear(dto: CrearSectorDto): Promise<any> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('sectores_estadio')
      .insert([
        {
          nombre: dto.nombre,
          capacidad: dto.capacidad,
          capacidad_disponible: dto.capacidad,
          precio: dto.precio,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

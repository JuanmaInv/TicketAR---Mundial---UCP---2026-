import { Injectable, NotFoundException } from '@nestjs/common';
import { CrearSectorDto } from './dto/create-stadium-sector.dto';
import { SectorEntidad } from './entities/stadium-sector.entity';
import { SupabaseService } from 'src/common/supabase/supabase.service';

@Injectable()
export class SectoresService {
  constructor(private readonly supabase: SupabaseService) { }

  async obtenerTodos() {
    const { data, error } = await this.supabase
      .getClient()
      .from('sectores_estadio')
      .select('*');

    if (error) {
      return [];
    }
    return data;
  }

  async obtenerUno(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('sectores_estadio')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Sector de estadio no encontrado');
    }
    return data;
  }

  async crear(dto: CrearSectorDto) {
    const { data, error } = await this.supabase
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

    if (error) {
      throw new Error('Error al crear el sector: ' + error.message);
    }
    return data;
  }
}

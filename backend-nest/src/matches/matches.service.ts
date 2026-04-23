import { Injectable } from '@nestjs/common';
import { CrearPartidoDto } from './dto/create-match.dto';
import { SupabaseService } from '../common/supabase/supabase.service';

/**
 * Servicio para gestionar los partidos del Mundial 2026.
 * Ahora conectado directamente a la base de datos de Supabase.
 */
@Injectable()
export class PartidosService {
  constructor(private readonly supabaseService: SupabaseService) {}
  /**
   * Crea un nuevo registro de partido.
   * Mapea de camelCase (Frontend/DTO) a snake_case (Base de Datos).
   */
  async crear(crearPartidoDto: CrearPartidoDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('partidos')
      .insert([
        {
          equipo_local: crearPartidoDto.equipoLocal,
          equipo_visitante: crearPartidoDto.equipoVisitante,
          fecha_partido: crearPartidoDto.fechaPartido,
          nombre_estadio: crearPartidoDto.nombreEstadio,
          fase: 'GRUPOS',
          estado: 'PROGRAMADO',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Obtiene todos los partidos de la tabla 'partidos' en Supabase.
   * Se agrega un log para depurar si la base de datos devuelve resultados.
   */
  async obtenerTodos() {
    console.log('--- Intentando obtener partidos de Supabase ---');

    const { data, error } = await this.supabaseService
      .getClient()
      .from('partidos')
      .select('*')
      .order('fecha_partido', { ascending: true });

    if (error) {
      console.error('Error de Supabase:', error.message);
      return [];
    }

    console.log(`Éxito: Se encontraron ${data?.length || 0} partidos.`);

    return data;
  }
}

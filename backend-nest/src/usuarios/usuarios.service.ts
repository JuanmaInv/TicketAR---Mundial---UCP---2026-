import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuarioEntidad } from './entities/usuario.entidad';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async crear(crearUsuarioDto: CrearUsuarioDto): Promise<UsuarioEntidad> {
    const { data, error } = await this.supabaseService.getClient()
      .from('usuarios')
      .insert([
        {
          correo: crearUsuarioDto.email, // Cambiado de email a correo
          nombre: crearUsuarioDto.nombre,
          apellido: crearUsuarioDto.apellido,
          numero_pasaporte: crearUsuarioDto.numeroPasaporte,
          telefono: crearUsuarioDto.telefono,
          localidad: crearUsuarioDto.localidad,
          provincia: crearUsuarioDto.provincia,
          rol: 'cliente',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return this.mapearEntidad(data);
  }

  async buscarPorEmail(correo: string): Promise<UsuarioEntidad | null> {
    const { data, error } = await this.supabaseService.getClient()
      .from('usuarios')
      .select('*')
      .eq('correo', correo) // Cambiado a correo
      .maybeSingle();

    if (error || !data) return null;
    return this.mapearEntidad(data);
  }

  async actualizar(correo: string, datos: any): Promise<UsuarioEntidad> {
    const { data, error } = await this.supabaseService.getClient()
      .from('usuarios')
      .update({
        nombre: datos.nombre,
        apellido: datos.apellido,
        numero_pasaporte: datos.numeroPasaporte,
        telefono: datos.telefono,
        localidad: datos.localidad,
        provincia: datos.provincia,
        fecha_actualizacion: new Date(),
      })
      .eq('correo', correo) // Cambiado a correo
      .select()
      .single();

    if (error) throw error;
    return this.mapearEntidad(data);
  }

  async obtenerTodos(): Promise<UsuarioEntidad[]> {
    const { data, error } = await this.supabaseService.getClient()
      .from('usuarios')
      .select('*');

    if (error) throw error;
    return data.map(u => this.mapearEntidad(u));
  }

  private mapearEntidad(data: any): UsuarioEntidad {
    return {
      id: data.id,
      email: data.correo, // Mapeamos de correo a email para el resto del sistema
      nombre: data.nombre,
      apellido: data.apellido,
      numeroPasaporte: data.numero_pasaporte,
      telefono: data.telefono,
      localidad: data.localidad,
      provincia: data.provincia,
      fechaCreacion: data.fecha_creacion,
      fechaActualizacion: data.fecha_actualizacion,
    };
  }
}

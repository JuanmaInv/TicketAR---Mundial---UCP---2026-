import { Injectable } from '@nestjs/common';
import { IUsuariosRepository } from './usuarios.repository.interface';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { UsuarioEntidad } from '../entities/usuario.entidad';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';

//CRUD aplicado a la tabla usuarios de la base de datos supabase usando patron REPOSITORY.

@Injectable()
export class SupabaseUsuariosRepository implements IUsuariosRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async crear(crearUsuarioDto: CrearUsuarioDto): Promise<UsuarioEntidad> {
    const { data, error } = (await this.supabaseService
      .getClient()
      .from('usuarios')
      .insert([
        {
          email: crearUsuarioDto.email,
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
      .single()) as { data: unknown; error: Error | null };

    if (error) throw error;
    return this.mapearEntidad(data);
  }

  async buscarPorEmail(correo: string): Promise<UsuarioEntidad | null> {
    const { data, error } = (await this.supabaseService
      .getClient()
      .from('usuarios')
      .select('*')
      .eq('email', correo)
      .maybeSingle()) as { data: unknown; error: Error | null };

    if (error || !data) return null;
    return this.mapearEntidad(data);
  }

  async buscarPorId(id: string): Promise<UsuarioEntidad | null> {
    const { data, error } = (await this.supabaseService
      .getClient()
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .maybeSingle()) as { data: unknown; error: Error | null };

    if (error || !data) return null;
    return this.mapearEntidad(data);
  }

  async actualizar(
    correo: string,
    datos: Partial<CrearUsuarioDto>,
  ): Promise<UsuarioEntidad> {
    const { data, error } = (await this.supabaseService
      .getClient()
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
      .eq('email', correo)
      .select()
      .single()) as { data: unknown; error: Error | null };

    if (error) throw error;
    return this.mapearEntidad(data);
  }

  async obtenerTodos(): Promise<UsuarioEntidad[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('usuarios')
      .select('*');

    if (error) throw error;
    return data.map((u) => this.mapearEntidad(u));
  }

  private mapearEntidad(data: unknown): UsuarioEntidad {
    const d = data as {
      id: string;
      email: string;
      nombre: string;
      apellido: string;
      numero_pasaporte: string;
      telefono: string;
      localidad: string;
      provincia: string;
      fecha_creacion: Date;
      fecha_actualizacion: Date;
    };

    return {
      id: d.id,
      email: d.email,
      nombre: d.nombre,
      apellido: d.apellido,
      numeroPasaporte: d.numero_pasaporte,
      telefono: d.telefono,
      localidad: d.localidad,
      provincia: d.provincia,
      fechaCreacion: d.fecha_creacion,
      fechaActualizacion: d.fecha_actualizacion,
    };
  }
}

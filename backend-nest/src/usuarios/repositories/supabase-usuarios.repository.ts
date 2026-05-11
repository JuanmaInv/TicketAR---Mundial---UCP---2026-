import { Injectable } from '@nestjs/common';
import { IUsuariosRepository } from './usuarios.repository.interface';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { UsuarioEntidad } from '../entities/usuario.entidad';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { RolUsuario } from '../../common/enums/rol-usuario.enum';

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
          rol: RolUsuario.CLIENTE,
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

  /**
   * Elimina un usuario por su ID.
   * La eliminación en cascada (entradas, reservas) es manejada por ON DELETE CASCADE en la DB.
   */
  async eliminar(id: string): Promise<void> {
    // Limpieza defensiva: si la base no tiene ON DELETE CASCADE
    // evitamos violaciones de FK eliminando primero las entradas del usuario.
    const { error: errorEntradas } = await this.supabaseService
      .getClient()
      .from('entradas')
      .delete()
      .eq('id_usuario', id);

    if (errorEntradas) {
      throw new Error(
        `No se pudieron eliminar las entradas asociadas al usuario ${id}: ${errorEntradas.message}`,
      );
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(
        `Error al eliminar usuario con ID ${id}: ${error.message}`,
      );
    }
  }

  private mapearEntidad(data: unknown): UsuarioEntidad {
    const d = data as {
      id: string;
      email: string;
      nombre: string;
      apellido: string;
      numero_pasaporte: string;
      rol: string;
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
      rol: d.rol as RolUsuario,
      telefono: d.telefono,
      localidad: d.localidad,
      provincia: d.provincia,
      fechaCreacion: d.fecha_creacion,
      fechaActualizacion: d.fecha_actualizacion,
    };
  }
}

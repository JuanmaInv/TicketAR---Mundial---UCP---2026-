import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketEntity } from './entities/ticket.entity';
import { SupabaseService } from '../common/supabase/supabase.service';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class EntradasService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async crear(crearEntradaDto: any): Promise<TicketEntity> {
    // Buscamos al usuario por su 'correo' (antes email)
    const usuario = await this.usuariosService.buscarPorEmail(
      crearEntradaDto.email,
    );

    if (!usuario) {
      throw new NotFoundException(
        `No se encontró un usuario registrado con el correo: ${crearEntradaDto.email}`,
      );
    }

    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 15);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('entradas')
      .insert([
        {
          id_usuario: usuario.id, // Cambiado de user_id a id_usuario
          id_partido: crearEntradaDto.partidoId, // Cambiado de partido_id a id_partido
          id_sector:
            crearEntradaDto.idSector || '40ec8ced-1589-44a4-a957-cfae9b862b4a', // Cambiado de sector_id
          estado: 'RESERVADO', // Cambiado de status a estado
          fecha_expiracion_reserva: expiracion, // Cambiado de reservation_expires_at
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al insertar entrada:', error.message);
      throw error;
    }

    return this.mapearTicket(data);
  }

  async obtenerTodas(): Promise<TicketEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('entradas')
      .select('*');

    if (error) throw error;
    return data.map((item) => this.mapearTicket(item));
  }

  async obtenerUna(id: string): Promise<TicketEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('entradas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapearTicket(data);
  }

  async marcarComoPagada(id: string): Promise<TicketEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('entradas')
      .update({ estado: 'CONFIRMADO' }) // Cambiado status -> estado
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapearTicket(data);
  }

  private mapearTicket(data: any): TicketEntity {
    return {
      id: data.id,
      userId: data.id_usuario,
      partidoId: data.id_partido,
      sectorId: data.id_sector,
      status: data.estado,
      reservationExpiresAt: data.fecha_expiracion_reserva,
      createdAt: data.fecha_creacion || new Date(),
      updatedAt: data.fecha_actualizacion || new Date(),
    };
  }
}

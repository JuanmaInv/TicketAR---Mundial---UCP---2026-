import { Injectable } from '@nestjs/common';
import { IEntradasRepository } from './entradas.repository.interface';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { TicketEntity } from '../entities/ticket.entity';
import { TicketStatus } from '../../common/enums/ticket-status.enum';

@Injectable()
export class SupabaseEntradasRepository implements IEntradasRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async validarPasaporteUsuario(idUsuario: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('numero_pasaporte')
      .eq('id', idUsuario)
      .single();

    if (error || !data?.numero_pasaporte) return false;
    return true;
  }

  async buscarEntradaActiva(
    idUsuario: string,
    idPartido: string,
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('entradas')
      .select('id')
      .eq('id_usuario', idUsuario)
      .eq('id_partido', idPartido)
      .neq('estado', TicketStatus.CANCELADO)
      .maybeSingle();

    return !!data;
  }

  async obtenerStockDisponible(
    idPartido: string,
    idSector: string,
  ): Promise<number | null> {
    const { data, error } = await this.supabase
      .from('partido_sectores')
      .select('asientos_disponibles')
      .eq('id_partido', idPartido)
      .eq('id_sector', idSector)
      .single();

    if (error || !data) return null;
    return data.asientos_disponibles;
  }

  async crear(datos: any): Promise<TicketEntity> {
    const { data, error } = await this.supabase
      .from('entradas')
      .insert([datos])
      .select()
      .single();

    if (error) throw error;
    return this.mapearTicket(data);
  }

  async obtenerTodas(): Promise<TicketEntity[]> {
    const { data, error } = await this.supabase
      .from('entradas')
      .select('*, partidos(*), sectores_estadio(*)');

    if (error) throw error;
    return data.map((item) => this.mapearTicket(item));
  }

  async obtenerUna(id: string): Promise<TicketEntity | null> {
    const { data, error } = await this.supabase
      .from('entradas')
      .select('*, partidos(*), sectores_estadio(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapearTicket(data);
  }

  async actualizarEstado(
    id: string,
    estado: TicketStatus,
  ): Promise<TicketEntity> {
    const { data, error } = await this.supabase
      .from('entradas')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapearTicket(data);
  }

  async obtenerExpiradas(fechaReferencia: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('entradas')
      .select('id, id_sector, id_partido')
      .eq('estado', TicketStatus.RESERVADO)
      .lt('fecha_expiracion_reserva', fechaReferencia);

    if (error) return [];
    return data;
  }

  async incrementarStock(idPartido: string, idSector: string): Promise<void> {
    await this.supabase.rpc('incrementar_stock_sector', {
      p_partido_id: idPartido,
      p_sector_id: idSector,
    });
  }

  private mapearTicket(data: any): TicketEntity {
    return {
      id: data.id,
      idUsuario: data.id_usuario,
      idPartido: data.id_partido,
      idSector: data.id_sector,
      estado: data.estado,
      fechaExpiracionReserva: data.fecha_expiracion_reserva
        ? new Date(data.fecha_expiracion_reserva)
        : undefined,
      fechaCreacion: new Date(data.created_at || data.fecha_creacion),
      fechaActualizacion: new Date(data.updated_at || data.fecha_actualizacion),
    };
  }
}

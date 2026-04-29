import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CrearEntradaDto } from './dto/create-ticket.dto';
import { TicketEntity } from './entities/ticket.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';

@Injectable()
export class EntradasService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Proceso Atómico de Reserva de Entrada.
   * Conectado a Supabase con nombres de entidad alineados con main.
   * Sigue las reglas de negocio: Pasaporte -> No duplicados -> Stock -> Insertar.
   */
  async crear(crearEntradaDto: CrearEntradaDto): Promise<TicketEntity> {
    const supabase = this.supabaseService.getClient();

    // 1. VALIDACIÓN DE PASAPORTE
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('pasaporte')
      .eq('id', crearEntradaDto.idUsuario)
      .single();

    if (errorUsuario || !usuario?.pasaporte) {
      throw new BadRequestException(
        'El usuario debe tener un pasaporte registrado para comprar.',
      );
    }

    // 2. REGLA CRÍTICA: MÁXIMO 1 ENTRADA POR PARTIDO
    // Usamos los nombres de columna actualizados (id_usuario, id_partido)
    const { data: entradaExistente } = await supabase
      .from('entradas')
      .select('id')
      .eq('id_usuario', crearEntradaDto.idUsuario)
      .eq('id_partido', crearEntradaDto.idPartido)
      .neq('estado', TicketStatus.CANCELADO)
      .maybeSingle();

    if (entradaExistente) {
      throw new ConflictException(
        'Ya tienes una reserva activa o pagada para este partido.',
      );
    }

    // 3. VERIFICACIÓN DE STOCK
    const { data: inventario, error: errorStock } = await supabase
      .from('partido_sectores')
      .select('asientos_disponibles')
      .eq('id_partido', crearEntradaDto.idPartido)
      .eq('id_sector', crearEntradaDto.idSector)
      .single();

    if (errorStock || !inventario) {
      throw new NotFoundException(
        'El sector solicitado no está disponible para este partido.',
      );
    }

    if (inventario.asientos_disponibles <= 0) {
      throw new ConflictException(
        'Lo sentimos, no quedan asientos disponibles en este sector.',
      );
    }

    // 4. CREACIÓN DE LA RESERVA (Trigger de DB bajará el stock)
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 15);

    const { data: nuevaEntrada, error: errorInsert } = await supabase
      .from('entradas')
      .insert([
        {
          id_usuario: crearEntradaDto.idUsuario,
          id_partido: crearEntradaDto.idPartido,
          id_sector: crearEntradaDto.idSector,
          estado: TicketStatus.RESERVADO,
          fecha_expiracion_reserva: fechaExpiracion.toISOString(),
        },
      ])
      .select()
      .single();

    if (errorInsert) {
      throw new BadRequestException(
        `Error al crear la reserva: ${errorInsert.message}`,
      );
    }

    return this.mapearTicket(nuevaEntrada);
  }

  async obtenerTodas(): Promise<TicketEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('entradas')
      .select('*, partidos(*), sectores_estadio(*)');

    if (error) throw new BadRequestException(error.message);
    return data.map(item => this.mapearTicket(item));
  }

  async obtenerUna(id: string): Promise<TicketEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('entradas')
      .select('*, partidos(*), sectores_estadio(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapearTicket(data);
  }

  async marcarComoPagada(id: string): Promise<TicketEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('entradas')
      .update({ estado: TicketStatus.PAGADO })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return this.mapearTicket(data);
  }

  // Tarea programada para limpiar reservas expiradas
  @Cron(CronExpression.EVERY_MINUTE)
  async manejarReservasExpiradas() {
    const ahora = new Date().toISOString();

    const { data: expiradas, error: errorBusqueda } = await this.supabaseService
      .getClient()
      .from('entradas')
      .select('id, id_sector, id_partido')
      .eq('estado', TicketStatus.RESERVADO)
      .lt('fecha_expiracion_reserva', ahora);

    if (errorBusqueda) {
      console.error('[Cron] Error buscando expiradas:', errorBusqueda.message);
      return;
    }

    if (expiradas && expiradas.length > 0) {
      for (const ticket of expiradas) {
        try {
          // Devolvemos el stock usando la función RPC
          await this.supabaseService.getClient().rpc('incrementar_stock_sector', {
            p_partido_id: ticket.id_partido,
            p_sector_id: ticket.id_sector,
          });

          // Marcamos como CANCELADO
          await this.supabaseService
            .getClient()
            .from('entradas')
            .update({ estado: TicketStatus.CANCELADO })
            .eq('id', ticket.id);

          console.log(`[Cron] Reserva ${ticket.id} cancelada por expiración.`);
        } catch (err) {
          console.error(`[Cron] Error procesando ticket ${ticket.id}:`, err.message);
        }
      }
    }
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

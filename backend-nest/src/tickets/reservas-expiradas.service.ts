import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseEntradasRepository } from './repositories/supabase-entradas.repository';
import { TicketStatus } from '../common/enums/ticket-status.enum';

interface TicketExpirado {
  id: string;
  id_sector: string;
  id_partido: string;
}

@Injectable()
export class ReservasExpiradasService {
  private readonly logger = new Logger(ReservasExpiradasService.name);

  constructor(
    @Inject('IEntradasRepository')
    private readonly entradasRepository: SupabaseEntradasRepository,
  ) {}

  /**
   * Cron Job que se ejecuta cada minuto.
   * Busca todas las reservas en estado RESERVADO cuya fecha de expiración
   * ya pasó y las cancela, liberando el stock para que otros usuarios puedan comprar.
   *
   * Regla de negocio: El servidor bloquea el lugar por 15 minutos.
   * Si el usuario no confirma el pago en ese tiempo, la entrada vuelve a estar disponible.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async liberarReservasExpiradas(): Promise<void> {
    const ahora = new Date().toISOString();
    this.logger.log(`[Cron] Buscando reservas expiradas antes de ${ahora}...`);

    // 1. Obtenemos todos los tickets RESERVADOS cuya fecha de expiración ya pasó
    const expiradas = await this.entradasRepository.obtenerExpiradas(ahora);

    if (expiradas.length === 0) {
      this.logger.debug('[Cron] No hay reservas expiradas en este ciclo.');
      return;
    }

    this.logger.warn(
      `[Cron] Se encontraron ${expiradas.length} reservas expiradas. Liberando...`,
    );

    // 2. Para cada reserva expirada, cancelamos el ticket y devolvemos el stock
    const resultados = await Promise.allSettled(
      (expiradas as TicketExpirado[]).map((ticket) =>
        this.procesarExpiracion(ticket),
      ),
    );

    // 3. Contamos éxitos y fallos para el log
    const exitosos = resultados.filter((r) => r.status === 'fulfilled').length;
    const fallidos = resultados.filter((r) => r.status === 'rejected').length;

    this.logger.log(
      `[Cron] Ciclo completado. Liberadas: ${exitosos}, Errores: ${fallidos}.`,
    );
  }

  /**
   * Procesa la expiración de un ticket individual de forma atómica:
   * 1. Cambia el estado del ticket a CANCELADO.
   * 2. Devuelve el asiento al stock del sector correspondiente.
   */
  private async procesarExpiracion(ticket: TicketExpirado): Promise<void> {
    try {
      // Cambiamos el estado a CANCELADO para liberar la reserva
      await this.entradasRepository.actualizarEstado(
        ticket.id,
        TicketStatus.CANCELADO,
      );

      // Devolvemos el asiento al inventario del sector
      await this.entradasRepository.incrementarStock(
        ticket.id_partido,
        ticket.id_sector,
      );

      this.logger.log(
        `[Cron] Reserva expirada liberada: Ticket ${ticket.id} (Partido: ${ticket.id_partido}, Sector: ${ticket.id_sector})`,
      );
    } catch (error) {
      this.logger.error(
        `[Cron] Error al liberar la reserva del ticket ${ticket.id}:`,
        error,
      );
      // Re-lanzamos para que Promise.allSettled lo registre como 'rejected'
      throw error;
    }
  }
}

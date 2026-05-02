import { BadRequestException, Logger } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { TicketEntity } from '../entities/ticket.entity';
import { PaymentsService } from '../../payments/payments.service';

export class ReservadoState implements TicketState {
  private ticket: TicketEntity;

  constructor(private readonly logger: Logger) {}

  setContext(ticket: TicketEntity): void {
    this.ticket = ticket;
  }

  get status(): TicketStatus {
    return TicketStatus.RESERVADO;
  }

  async pagar(paymentsService: PaymentsService): Promise<void> {
    const ahora = new Date();
    if (
      this.ticket.fechaExpiracionReserva &&
      ahora > this.ticket.fechaExpiracionReserva
    ) {
      this.logger.warn(`Intento de pago en ticket expirado: ${this.ticket.id}`);
      throw new BadRequestException(
        'La reserva ha expirado (pasaron los 15 min).',
      );
    }

    // Usamos el servicio de pagos (Patrón Strategy) con un precio fijo simulado (ej: 50000)
    const resultado = await paymentsService.processTicketPayment(50000);

    if (!resultado.success) {
      this.logger.error(
        `Error en el pago para el ticket ${this.ticket.id}: ${resultado.error}`,
      );
      throw new BadRequestException(
        `El pago no pudo procesarse: ${resultado.error}`,
      );
    }

    this.logger.log(
      `Pago confirmado [${resultado.transactionId}]. Transición exitosa: Ticket ${this.ticket.id} pasando a PAGADO.`,
    );
  }

  cancelar(): void {
    this.logger.log(`Cancelando reserva del ticket ${this.ticket.id}.`);
  }
}

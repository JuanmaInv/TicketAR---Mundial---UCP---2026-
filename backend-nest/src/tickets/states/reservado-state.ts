import { BadRequestException, Logger } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { TicketEntity } from '../entities/ticket.entity';

export class ReservadoState implements TicketState {
  private ticket: TicketEntity;

  constructor(private readonly logger: Logger) {}

  setContext(ticket: TicketEntity): void {
    this.ticket = ticket;
  }

  get status(): TicketStatus {
    return TicketStatus.RESERVADO;
  }

  pagar(): void {
    const ahora = new Date();
    if (this.ticket.fechaExpiracionReserva && ahora > this.ticket.fechaExpiracionReserva) {
      this.logger.warn(`Intento de pago en ticket expirado: ${this.ticket.id}`);
      throw new BadRequestException('La reserva ha expirado (pasaron los 15 min).');
    }
    
    this.logger.log(`Transición exitosa: Ticket ${this.ticket.id} pasando a PAGADO.`);
  }

  cancelar(): void {
    this.logger.log(`Cancelando reserva del ticket ${this.ticket.id}.`);
  }
}

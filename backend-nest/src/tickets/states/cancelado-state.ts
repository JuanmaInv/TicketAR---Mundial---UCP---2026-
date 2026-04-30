import { BadRequestException, Logger } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { TicketEntity } from '../entities/ticket.entity';

export class CanceladoState implements TicketState {
  private ticket: TicketEntity;

  constructor(private readonly logger: Logger) {}

  setContext(ticket: TicketEntity): void {
    this.ticket = ticket;
  }

  get status(): TicketStatus {
    return TicketStatus.CANCELADO;
  }

  pagar(): void {
    this.logger.error(`Intento de pago en ticket CANCELADO: ${this.ticket.id}`);
    throw new BadRequestException(
      'No se puede pagar una entrada que ha sido cancelada.',
    );
  }

  cancelar(): void {
    throw new BadRequestException('Esta entrada ya está cancelada.');
  }
}

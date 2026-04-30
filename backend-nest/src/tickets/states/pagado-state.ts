import { BadRequestException, Logger } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { TicketEntity } from '../entities/ticket.entity';

export class PagadoState implements TicketState {
  private ticket: TicketEntity;

  constructor(private readonly logger: Logger) {}

  setContext(ticket: TicketEntity): void {
    this.ticket = ticket;
  }

  get status(): TicketStatus {
    return TicketStatus.PAGADO;
  }

  pagar(): void {
    this.logger.warn(`Intento de doble pago en ticket: ${this.ticket.id}`);
    throw new BadRequestException(
      'Esta entrada ya ha sido pagada correctamente.',
    );
  }

  cancelar(): void {
    throw new BadRequestException(
      'No se puede cancelar una entrada que ya ha sido pagada.',
    );
  }
}

import { BadRequestException, Logger } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { TicketEntity } from '../entities/ticket.entity';
import { PaymentsService } from '../../payments/payments.service';

export class CanceladoState implements TicketState {
  private ticket: TicketEntity;

  constructor(private readonly logger: Logger) {}

  setContext(ticket: TicketEntity): void {
    this.ticket = ticket;
  }

  get status(): TicketStatus {
    return TicketStatus.CANCELADO;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pagar(_paymentsService: PaymentsService): Promise<void> {
    return Promise.reject(
      new BadRequestException(
        'No se puede pagar un ticket que ha sido cancelado.',
      ),
    );
  }

  cancelar(): void {
    throw new BadRequestException('Este ticket ya está cancelado.');
  }
}

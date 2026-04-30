import { BadRequestException, Logger } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { TicketEntity } from '../entities/ticket.entity';
import { PaymentsService } from '../../payments/payments.service';

export class PagadoState implements TicketState {
  private ticket: TicketEntity;

  constructor(private readonly logger: Logger) {}

  setContext(ticket: TicketEntity): void {
    this.ticket = ticket;
  }

  get status(): TicketStatus {
    return TicketStatus.PAGADO;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pagar(_paymentsService: PaymentsService): Promise<void> {
    return Promise.reject(
      new BadRequestException('Este ticket ya ha sido pagado.'),
    );
  }

  cancelar(): void {
    throw new BadRequestException(
      'No se puede cancelar una entrada que ya ha sido pagada.',
    );
  }
}

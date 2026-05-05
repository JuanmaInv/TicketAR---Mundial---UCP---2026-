import { BadRequestException, Logger } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { TicketEntity } from '../entities/ticket.entity';
import { PaymentsService } from '../../payments/payments.service';
import { PaymentResult } from '../../payments/strategies/payment-strategy.interface';

export class PagadoState implements TicketState {
  private ticket: TicketEntity;

  constructor(private readonly logger: Logger) { }

  setContext(ticket: TicketEntity): void {
    this.ticket = ticket;
  }

  get status(): TicketStatus {
    return TicketStatus.PAGADO;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pagar(_paymentsService: PaymentsService): Promise<PaymentResult> {
    return Promise.reject(
      new BadRequestException('Este ticket ya ha sido pagado.'),
    );
  }

  confirmarPago(): void {
    throw new BadRequestException('El ticket ya se encuentra pagado.');
  }

  //Metodo cancelar tira una excepcion ya que el ticket esta pagado
  cancelar(): void {
    throw new BadRequestException(
      'No se puede cancelar una entrada que ya ha sido pagada.',
    );
  }
}

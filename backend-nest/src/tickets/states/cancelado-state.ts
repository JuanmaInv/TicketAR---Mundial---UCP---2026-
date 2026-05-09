import { BadRequestException, Logger } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { TicketEntity } from '../entities/ticket.entity';
import { PaymentsService } from '../../payments/payments.service';
import { PaymentResult } from '../../payments/strategies/payment-strategy.interface';

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
  pagar(_paymentsService: PaymentsService): Promise<PaymentResult> {
    return Promise.reject(
      new BadRequestException(
        'No se puede pagar un ticket que ha sido cancelado.',
      ),
    );
  }

  //Metodo confirmarPago tira una excepcion ya que el ticket esta cancelado
  confirmarPago(): void {
    throw new BadRequestException(
      'No se puede confirmar el pago de un ticket cancelado.',
    );
  }

  //Metodo cancelar tira una excepcion ya que el ticket esta cancelado
  cancelar(): void {
    throw new BadRequestException('Este ticket ya está cancelado.');
  }
}

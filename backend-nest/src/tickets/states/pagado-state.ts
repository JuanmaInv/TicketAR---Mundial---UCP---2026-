import { BadRequestException } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { TicketEntity } from '../entities/ticket.entity';
import { PaymentsService } from '../../payments/payments.service';
import { PaymentResult } from '../../payments/strategies/payment-strategy.interface';

export class PagadoState implements TicketState {
  private ticket!: TicketEntity;
  constructor(logger: unknown) {
    void logger;
  }

  setContext(ticket: TicketEntity): void {
    this.ticket = ticket;
  }

  get status(): TicketStatus {
    return TicketStatus.PAGADO;
  }

  async pagar(
    _paymentsService: PaymentsService,
    _amount: number,
    _cantidad: number,
  ): Promise<PaymentResult> {
    void _paymentsService;
    void _amount;
    void _cantidad;
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

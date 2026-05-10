import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { IState } from '../../common/patterns/state.interface';
import { TicketEntity } from '../entities/ticket.entity';
import { PaymentsService } from '../../payments/payments.service';
import { PaymentResult } from '../../payments/strategies/payment-strategy.interface';

export interface TicketState extends IState<TicketEntity> {
  get status(): TicketStatus;
  pagar(paymentsService: PaymentsService, amount: number, cantidad: number): Promise<PaymentResult>;
  confirmarPago(): void;
  cancelar(): void;
}

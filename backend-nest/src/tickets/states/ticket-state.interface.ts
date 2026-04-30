import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { IState } from '../../common/patterns/state.interface';
import { TicketEntity } from '../entities/ticket.entity';
import { PaymentsService } from '../../payments/payments.service';

export interface TicketState extends IState<TicketEntity> {
  get status(): TicketStatus;
  pagar(paymentsService: PaymentsService): Promise<void>;
  cancelar(): void;
}

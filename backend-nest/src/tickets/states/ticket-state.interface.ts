import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { IState } from '../../common/patterns/state.interface';
import { TicketEntity } from '../entities/ticket.entity';

export interface TicketState extends IState<TicketEntity> {
  get status(): TicketStatus;
  pagar(): void;
  cancelar(): void;
}

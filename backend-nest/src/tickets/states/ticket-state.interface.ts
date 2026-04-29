import { TicketStatus } from '../../common/enums/ticket-status.enum';

export interface TicketState {
  get status(): TicketStatus;
  pagar(): void;
  cancelar(): void;
}

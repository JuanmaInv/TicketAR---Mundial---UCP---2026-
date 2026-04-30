import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { ReservadoState } from './reservado-state';
import { PagadoState } from './pagado-state';
import { CanceladoState } from './cancelado-state';

export class TicketStateFactory {
  static create(status: TicketStatus): TicketState {
    switch (status) {
      case TicketStatus.RESERVADO:
        return new ReservadoState();
      case TicketStatus.PAGADO:
        return new PagadoState();
      case TicketStatus.CANCELADO:
        return new CanceladoState();
      default:
        throw new Error(`Estado de ticket desconocido: ${status as string}`);
    }
  }
}

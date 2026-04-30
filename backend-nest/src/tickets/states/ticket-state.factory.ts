import { Injectable, Logger } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';
import { ReservadoState } from './reservado-state';
import { PagadoState } from './pagado-state';
import { CanceladoState } from './cancelado-state';

@Injectable()
export class TicketStateFactory {
  private readonly logger = new Logger(TicketStateFactory.name);

  create(status: TicketStatus): TicketState {
    switch (status) {
      case TicketStatus.RESERVADO:
        return new ReservadoState(this.logger);
      case TicketStatus.PAGADO:
        return new PagadoState(this.logger);
      case TicketStatus.CANCELADO:
        return new CanceladoState(this.logger);
      default:
        throw new Error(`Estado de ticket desconocido: ${status as string}`);
    }
  }
}

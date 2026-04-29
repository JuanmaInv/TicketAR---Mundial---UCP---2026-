import { BadRequestException } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';

export class PagadoState implements TicketState {
  get status(): TicketStatus {
    return TicketStatus.PAGADO;
  }

  pagar(): void {
    throw new BadRequestException('Esta entrada ya ha sido pagada correctamente.');
  }

  cancelar(): void {
    throw new BadRequestException('No se puede cancelar una entrada que ya ha sido pagada.');
  }
}

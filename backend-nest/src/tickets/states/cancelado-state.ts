import { BadRequestException } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';

export class CanceladoState implements TicketState {
  get status(): TicketStatus {
    return TicketStatus.CANCELADO;
  }

  pagar(): void {
    throw new BadRequestException(
      'No se puede pagar una reserva que ha expirado o ha sido cancelada. Por favor, realice una nueva reserva.',
    );
  }

  cancelar(): void {
    // Ya está cancelado, no hacemos nada o lanzamos error si queremos ser estrictos
    throw new BadRequestException('La reserva ya se encuentra cancelada.');
  }
}

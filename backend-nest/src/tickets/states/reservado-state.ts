import { BadRequestException } from '@nestjs/common';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketState } from './ticket-state.interface';

export class ReservadoState implements TicketState {
  get status(): TicketStatus {
    return TicketStatus.RESERVADO;
  }

  pagar(): void {
    // Es una transición válida, no hace nada (permite continuar)
    console.log('Transición válida: De RESERVADO a PAGADO');
  }

  cancelar(): void {
    // Es una transición válida
    console.log('Transición válida: De RESERVADO a CANCELADO');
  }
}

import { TicketStatus } from '../../common/enums/ticket-status.enum';

export class TicketEntity {
  id: string;
  userId: string;
  partidoId: string;
  sectorId: string;
  status: TicketStatus;
  reservationExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

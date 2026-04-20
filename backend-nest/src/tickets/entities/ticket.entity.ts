import { TicketStatus } from '../../common/enums/ticket-status.enum';

export class TicketEntity {
  id: string; // UUID de Supabase
  userId: string; // Relación con el Usuario (quién compra)
  sectorId: string; // Relación con StadiumSector (dónde se sienta)

  status: TicketStatus; // RESERVED (bloqueo 15min), PAID, CANCELLED

  reservationExpiresAt?: Date; // Fundamental para la regla de negocio de "bloqueo temporal"

  qrCode?: string; // Se generará y llenará únicamente cuando el status pase a PAID

  createdAt: Date;
  updatedAt: Date;
}

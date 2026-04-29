import { TicketStatus } from '../../common/enums/ticket-status.enum';

export class TicketEntity {
  id: string; // UUID de Supabase
  idUsuario: string; // Relación con el Usuario
  idPartido: string; // Relación con el Partido
  idSector: string; // Relación con el Sector

  estado: TicketStatus; // RESERVADO, PAGADO, CANCELADO

  fechaExpiracionReserva?: Date; // Bloqueo temporal de 15 min

  codigoQr?: string; // Se genera al pagar

  fechaCreacion: Date;
  fechaActualizacion: Date;
}

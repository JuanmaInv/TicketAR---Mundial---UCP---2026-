import { TicketStatus } from '../../common/enums/ticket-status.enum';

export class TicketEntity {
  id: string; // UUID de Supabase
  idUsuario: string; // Relación con el Usuario
  idPartido: string; // Relación con el Partido
  idSector: string; // Relación con el Sector

  cantidad: number; // Cantidad de entradas agrupadas en esta fila
  precioUnitario: number; // Precio del sector al momento de la reserva
  precioTotal: number; // cantidad * precioUnitario

  estado: TicketStatus; // RESERVADO, PAGADO, CANCELADO

  fechaExpiracionReserva?: Date; // Bloqueo temporal de 15 min

  codigoQr?: string; // Se genera al pagar
  mercadopagoPaymentId?: string; // ID de pago de Mercado Pago

  fechaCreacion: Date;
  fechaActualizacion: Date;
}

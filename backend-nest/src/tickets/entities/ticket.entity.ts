import { TicketStatus } from '../../common/enums/ticket-status.enum';

export class TicketEntity {
  // --- ETAPA 1: INICIACIÓN (La intención de compra) ---
  id: string;        // Identificador único generado al crear la reserva.
  userId: string;    // El hincha que está intentando comprar.
  partidoId: string; // El partido específico que eligió.
  sectorId: string;  // El sector del estadio donde se quiere sentar.

  // --- ETAPA 2: RESERVA (El bloqueo de 15 minutos) ---
  status: TicketStatus;        // Inicia en 'RESERVADO' para bloquear el lugar.
  reservationExpiresAt?: Date; // El "deadline" crítico: si pasa este tiempo, el lugar se libera.

  // --- ETAPA 3: FINALIZACIÓN (Solo tras confirmar el pago) ---
  qrCode?: string; // El "ticket real": solo se genera y llena cuando el pago es exitoso.

  // --- ETAPA 4: AUDITORÍA (Control de tiempos del sistema) ---
  createdAt: Date; // Cuándo se inició el proceso de compra.
  updatedAt: Date; // Cuándo fue la última actualización (ej: el cambio a 'PAGADO').
}

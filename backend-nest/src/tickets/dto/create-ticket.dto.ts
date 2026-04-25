import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO para la creación de entradas (Escudo Protector).
 * Implementa el principio de 'Mínimo Privilegio': solo permite los campos 
 * necesarios para iniciar una reserva. Campos críticos como 'status', 'qrCode' 
 * o 'reservationExpiresAt' son controlados exclusivamente por el servidor.
 */
export class CreateTicketDto {
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio para la reserva' })
  userId: string;

  @IsUUID('4', { message: 'El ID del partido debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del partido es obligatorio' })
  partidoId: string; // Vinculación crítica para asegurar stock por evento.

  @IsUUID('4', { message: 'El ID del sector debe ser un UUID válido' })
  @IsNotEmpty({ message: 'Debe especificar un sector para reservar' })
  sectorId: string;
}

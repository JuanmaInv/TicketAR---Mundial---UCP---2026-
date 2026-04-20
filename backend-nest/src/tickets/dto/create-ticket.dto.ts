import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTicketDto {
  @IsString({ message: 'El ID del usuario debe ser válido' })
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio para la reserva' })
  userId: string;

  @IsString({ message: 'El ID del sector debe ser válido' })
  @IsNotEmpty({ message: 'Debe especificar un sector para reservar' })
  sectorId: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class CrearEntradaDto {
  @IsString({ message: 'El ID del usuario debe ser válido' })
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio para la reserva' })
  idUsuario: string;

  @IsString({ message: 'El ID del sector debe ser válido' })
  @IsNotEmpty({ message: 'Debe especificar un sector para reservar' })
  idSector: string;
}

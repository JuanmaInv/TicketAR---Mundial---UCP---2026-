import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO para la creación de entradas (Escudo Protector).
 */
export class CrearEntradaDto {
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
  idUsuario: string;

  @IsUUID('4', { message: 'El ID del partido debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del partido es obligatorio' })
  idPartido: string;

  @IsUUID('4', { message: 'El ID del sector debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del sector es obligatorio' })
  idSector: string;
}

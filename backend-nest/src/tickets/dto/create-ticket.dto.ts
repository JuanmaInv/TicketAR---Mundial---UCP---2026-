import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para la creación de entradas (Escudo Protector).
 */
export class CrearEntradaDto {
  @IsString({ message: 'El ID del usuario debe ser un texto válido' })
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
  idUsuario: string;

  @IsString({ message: 'El ID del partido debe ser un texto válido' })
  @IsNotEmpty({ message: 'El ID del partido es obligatorio' })
  idPartido: string;

  @IsString({ message: 'El ID del sector debe ser un texto válido' })
  @IsNotEmpty({ message: 'El ID del sector es obligatorio' })
  idSector: string;
}

import { IsNotEmpty, IsUUID, IsInt, Min, Max } from 'class-validator';

/**
 * DTO para la creación de entradas (Escudo Protector).
 * El frontend envía solo idUsuario, idPartido, idSector y cantidad.
 * El backend calcula precioUnitario y precioTotal desde Supabase.
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

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'Debe comprar al menos 1 entrada' })
  @Max(6, { message: 'Máximo 6 entradas por compra' })
  cantidad: number;
}

import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

/**
 * DTO para actualizar un partido existente.
 * Todos los campos son opcionales: solo se actualizan los que se envian.
 */
export class ActualizarPartidoDto {
  @IsOptional()
  @IsString({ message: 'El equipo local debe ser un texto' })
  equipoLocal?: string;

  @IsOptional()
  @IsString({ message: 'El equipo visitante debe ser un texto' })
  equipoVisitante?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha del partido debe ser una fecha valida' },
  )
  fechaPartido?: string;

  @IsOptional()
  @IsString({ message: 'El nombre del estadio debe ser un texto' })
  nombreEstadio?: string;

  @IsOptional()
  @IsString({ message: 'La fase debe ser un texto (ej: Grupos, Final)' })
  fase?: string;

  @IsOptional()
  @IsIn(['disponible', 'agotado', 'cancelado'], {
    message: 'El estado debe ser disponible, agotado o cancelado',
  })
  estado?: 'disponible' | 'agotado' | 'cancelado';
}

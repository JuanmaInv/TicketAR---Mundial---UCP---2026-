import { IsString, IsDateString } from 'class-validator';

export class CrearPartidoDto {
  @IsString({ message: 'El equipo local es obligatorio' })
  equipoLocal: string;

  @IsString({ message: 'El equipo visitante es obligatorio' })
  equipoVisitante: string;

  @IsDateString(
    {},
    { message: 'La fecha del partido debe ser una fecha válida' },
  )
  fechaPartido: string;

  @IsString({ message: 'El nombre del estadio es obligatorio' })
  nombreEstadio: string;

  @IsString({ message: 'La fase es obligatoria (ej: Grupos, Final)' })
  fase: string;
}

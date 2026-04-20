import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CrearPartidoDto {
  @IsString({ message: 'El equipo local debe ser texto' })
  @IsNotEmpty({ message: 'El equipo local es obligatorio' })
  equipoLocal: string;

  @IsString({ message: 'El equipo visitante debe ser texto' })
  @IsNotEmpty({ message: 'El equipo visitante es obligatorio' })
  equipoVisitante: string;

  @IsDateString({}, { message: 'La fecha del partido debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha del partido es obligatoria' })
  fechaPartido: Date;

  @IsString({ message: 'El nombre del estadio debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del estadio es obligatorio' })
  nombreEstadio: string;
}

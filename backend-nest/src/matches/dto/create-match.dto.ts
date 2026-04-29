import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CrearPartidoDto {
  @IsString({ message: 'El equipo local debe ser un texto' })
  @IsNotEmpty({ message: 'El equipo local es obligatorio' })
  equipoLocal: string;

  @IsString({ message: 'El equipo visitante debe ser un texto' })
  @IsNotEmpty({ message: 'El equipo visitante es obligatorio' })
  equipoVisitante: string;

  @IsString({ message: 'La fecha del partido debe ser un texto (ISO)' })
  @IsNotEmpty({ message: 'La fecha del partido es obligatoria' })
  fechaPartido: string;

  @IsString({ message: 'El nombre del estadio debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del estadio es obligatorio' })
  nombreEstadio: string;

  @IsString({ message: 'La fase debe ser un texto' })
  @IsOptional()
  fase?: string;

  @IsString({ message: 'El estado debe ser un texto' })
  @IsOptional()
  estado?: string;

  @IsNumber({}, { message: 'El precio base debe ser un número' })
  @IsNotEmpty({ message: 'El precio base es obligatorio' })
  precioBase: number;
}

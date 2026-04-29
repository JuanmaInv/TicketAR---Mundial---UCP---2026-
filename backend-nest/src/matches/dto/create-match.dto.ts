import { IsDateString, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CrearPartidoDto {
  @IsString()
  @IsNotEmpty()
  equipoLocal: string;

  @IsString()
  @IsNotEmpty()
  equipoVisitante: string;

  @IsDateString()
  @IsNotEmpty()
  fechaPartido: string;

  @IsString()
  @IsNotEmpty()
  nombreEstadio: string;

  @IsString()
  @IsNotEmpty()
  fase: string;

  @IsNumber()
  @IsNotEmpty()
  precioBase: number;
}

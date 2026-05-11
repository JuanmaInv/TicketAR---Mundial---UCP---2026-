import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class ActualizarSectorEnPartidoDto {
  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un numero' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio?: number;

  @IsOptional()
  @IsInt({ message: 'La cantidad disponible debe ser un entero' })
  @Min(0, { message: 'La cantidad disponible no puede ser negativa' })
  capacidadDisponible?: number;

  @IsOptional()
  @IsInt({ message: 'Los asientos disponibles deben ser un entero' })
  @Min(0, { message: 'Los asientos disponibles no pueden ser negativos' })
  asientosDisponibles?: number;
}

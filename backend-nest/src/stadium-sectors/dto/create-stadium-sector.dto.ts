import { IsString, IsNumber, Min } from 'class-validator';

export class CrearSectorDto {
  @IsString({ message: 'El nombre del sector debe ser texto' })
  nombre: string;

  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @Min(1, { message: 'La capacidad mínima es 1' })
  capacidad: number;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio: number; // Precio en ARS
}

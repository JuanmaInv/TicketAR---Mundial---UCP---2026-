import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ValidarPasaporteDto {
  @IsString({ message: 'El ID de usuario debe ser texto' })
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
  idUsuario: string;

  @IsString({ message: 'El número de documento debe ser texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numerodocumento: string;

  @IsString({ message: 'El código de país debe ser texto' })
  @Length(2, 3, { message: 'El código de país debe tener 2 o 3 caracteres (ej: AR, USA)' })
  codigoPais: string;
}

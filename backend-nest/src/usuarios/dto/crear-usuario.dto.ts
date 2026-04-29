import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CrearUsuarioDto {
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsString({ message: 'El pasaporte debe ser un texto' })
  @IsNotEmpty({
    message: 'El pasaporte es obligatorio para validar la entrada',
  })
  numeroPasaporte: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  localidad?: string;

  @IsOptional()
  @IsString()
  provincia?: string;
}

import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

// Sectores disponibles según nuestras reglas de negocio
export enum SectorType {
  PLATEA = 'PLATEA',
  PALCO = 'PALCO',
  POPULAR = 'POPULAR',
  PRENSA = 'PRENSA',
}

export class CreateTicketDto {
  // Aquí usamos los decoradores de class-validator para asegurar que el Frontend nos envíe datos correctos

  @IsNotEmpty({ message: 'El ID del partido es obligatorio' })
  @IsString()
  matchId: string;

  @IsEnum(SectorType, { message: 'El sector debe ser PLATEA, PALCO, POPULAR o PRENSA' })
  @IsNotEmpty()
  sector: SectorType;

  // NOTA: No le pedimos el 'userId' al frontend aquí por seguridad.
  // Ese ID lo sacaremos luego del Token de Sesión (Pasaporte).
}

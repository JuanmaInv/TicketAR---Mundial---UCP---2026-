import { Injectable } from '@nestjs/common';
import { IValidacionDocumentoStrategy } from './validacion-documento.strategy';

@Injectable()
export class PasaporteValidacionStrategy implements IValidacionDocumentoStrategy {
  canHandle(type: string): boolean {
    return type.toUpperCase() === 'PASAPORTE';
  }

  execute(pasaporte: string): boolean {
    const passportRegex = /^[A-Z0-9]{6,9}$/i;
    return passportRegex.test(pasaporte);
  }

  getErrorMessage(): string {
    return 'El formato del Pasaporte no es válido (debe ser alfanumérico de 6 a 9 caracteres).';
  }
}

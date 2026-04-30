import { Injectable } from '@nestjs/common';
import { IValidacionDocumentoStrategy } from './validacion-documento.strategy';

@Injectable()
export class DniValidacionStrategy implements IValidacionDocumentoStrategy {
  canHandle(type: string): boolean {
    return type.toUpperCase() === 'DNI';
  }

  execute(dni: string): boolean {
    const dniRegex = /^\d{7,8}$/;
    return dniRegex.test(dni);
  }

  getErrorMessage(): string {
    return 'El formato del DNI no es válido (debe tener 7 u 8 números).';
  }
}

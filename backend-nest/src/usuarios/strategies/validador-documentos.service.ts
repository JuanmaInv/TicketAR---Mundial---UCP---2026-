import { Injectable, BadRequestException } from '@nestjs/common';
import { DniValidacionStrategy } from './dni-validacion.strategy';
import { PasaporteValidacionStrategy } from './pasaporte-validacion.strategy';
import { IValidacionDocumentoStrategy } from './validacion-documento.strategy';

@Injectable()
export class ValidadorDocumentosService {
  private strategies: IValidacionDocumentoStrategy[];

  constructor(
    private readonly dniStrategy: DniValidacionStrategy,
    private readonly pasaporteStrategy: PasaporteValidacionStrategy,
  ) {
    this.strategies = [this.dniStrategy, this.pasaporteStrategy];
  }

  validar(tipo: string, valor: string): void {
    const strategy = this.strategies.find((s) => s.canHandle(tipo));

    if (!strategy) {
      throw new BadRequestException(`No hay una estrategia de validación para el tipo: ${tipo}`);
    }

    const esValido = strategy.execute(valor);

    if (!esValido) {
      throw new BadRequestException(strategy.getErrorMessage());
    }
  }
}

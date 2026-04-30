import { IStrategy } from '../../common/patterns/strategy.interface';

export interface IValidacionDocumentoStrategy extends IStrategy<string, boolean> {
  getErrorMessage(): string;
}

/**
 * Interfaz genérica para el patrón Strategy.
 * @template TInput El tipo de entrada para la estrategia
 * @template TOutput El tipo de salida de la estrategia
 */
export interface IStrategy<TInput, TOutput> {
  execute(data: TInput): TOutput;
  canHandle(type: string): boolean;
}

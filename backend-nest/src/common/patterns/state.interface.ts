/**
 * Interfaz genérica para el patrón State.
 * @template T El tipo del contexto (ej. Ticket)
 */
export interface IState<T> {
  setContext(context: T): void;
}

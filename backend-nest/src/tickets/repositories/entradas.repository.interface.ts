import { TicketEntity } from '../entities/ticket.entity';
import { TicketStatus } from '../../common/enums/ticket-status.enum';

/**
 * Datos requeridos para crear una entrada en Supabase.
 */
export interface CrearEntradaDatos {
  id_usuario: string;
  id_partido: string;
  id_sector: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  estado: TicketStatus;
  fecha_expiracion_reserva: string;
}

/**
 * Datos de una entrada expirada para el Cron Job.
 */
export interface EntradaExpirada {
  id: string;
  id_partido: string;
  id_sector: string;
  cantidad: number;
}

export interface IEntradasRepository {
  // Consultas de negocio
  validarPasaporteUsuario(idUsuario: string): Promise<boolean>;
  /**
   * Cuenta cuántas entradas activas (RESERVADO o PAGADO) tiene el usuario para un partido.
   * Suma el campo cantidad de cada fila (entradas agrupadas).
   * Regla de negocio: Máximo 6 entradas por cuenta por partido.
   */
  contarEntradasActivas(idUsuario: string, idPartido: string): Promise<number>;
  obtenerStockDisponible(
    idPartido: string,
    idSector: string,
  ): Promise<number | null>;

  // CRUD y Estados
  crear(datos: CrearEntradaDatos): Promise<TicketEntity>;
  obtenerTodas(): Promise<TicketEntity[]>;
  obtenerUna(id: string): Promise<TicketEntity | null>;
  actualizarEstado(id: string, estado: TicketStatus): Promise<TicketEntity>;
  guardarPaymentId(id: string, paymentId: string): Promise<void>;

  // Lógica de stock (update directo, sin RPC)
  decrementarStock(
    idPartido: string,
    idSector: string,
    cantidad: number,
  ): Promise<void>;
  incrementarStock(
    idPartido: string,
    idSector: string,
    cantidad: number,
  ): Promise<void>;

  // Lógica de expiración (para el Cron)
  obtenerExpiradas(fechaReferencia: string): Promise<EntradaExpirada[]>;
  // Recálculo de estado del partido según stock total
  recalcularEstadoPartido(idPartido: string): Promise<void>;
}

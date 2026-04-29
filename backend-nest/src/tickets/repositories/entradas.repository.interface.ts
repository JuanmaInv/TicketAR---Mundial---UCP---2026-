import { TicketEntity } from '../entities/ticket.entity';
import { TicketStatus } from '../../common/enums/ticket-status.enum';

export interface IEntradasRepository {
  // Consultas de negocio
  validarPasaporteUsuario(idUsuario: string): Promise<boolean>;
  buscarEntradaActiva(idUsuario: string, idPartido: string): Promise<boolean>;
  obtenerStockDisponible(
    idPartido: string,
    idSector: string,
  ): Promise<number | null>;

  // CRUD y Estados
  crear(datos: any): Promise<TicketEntity>;
  obtenerTodas(): Promise<TicketEntity[]>;
  obtenerUna(id: string): Promise<TicketEntity | null>;
  actualizarEstado(id: string, estado: TicketStatus): Promise<TicketEntity>;

  // Lógica de expiración (para el Cron)
  obtenerExpiradas(fechaReferencia: string): Promise<any[]>;
  incrementarStock(idPartido: string, idSector: string): Promise<void>;
}

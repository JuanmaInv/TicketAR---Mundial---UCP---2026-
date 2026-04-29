import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrearEntradaDto } from './dto/create-ticket.dto';
import { TicketEntity } from './entities/ticket.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import type { IEntradasRepository } from './repositories/entradas.repository.interface';

@Injectable()
export class EntradasService {
  constructor(
    @Inject('IEntradasRepository')
    private readonly entradasRepository: IEntradasRepository,
  ) {}

  async crear(crearEntradaDto: CrearEntradaDto): Promise<TicketEntity> {
    // 1. VALIDACIÓN DE PASAPORTE
    const tienePasaporte =
      await this.entradasRepository.validarPasaporteUsuario(
        crearEntradaDto.idUsuario,
      );
    if (!tienePasaporte) {
      throw new BadRequestException(
        'El usuario debe tener un pasaporte registrado para comprar.',
      );
    }

    // 2. REGLA CRÍTICA: MÁXIMO 1 ENTRADA POR PARTIDO
    const yaTieneEntrada = await this.entradasRepository.buscarEntradaActiva(
      crearEntradaDto.idUsuario,
      crearEntradaDto.idPartido,
    );
    if (yaTieneEntrada) {
      throw new ConflictException(
        'Ya tienes una reserva activa o pagada para este partido.',
      );
    }

    // 3. VERIFICACIÓN DE STOCK
    const stock = await this.entradasRepository.obtenerStockDisponible(
      crearEntradaDto.idPartido,
      crearEntradaDto.idSector,
    );

    if (stock === null) {
      throw new NotFoundException(
        'El sector solicitado no está disponible para este partido.',
      );
    }

    if (stock <= 0) {
      throw new ConflictException(
        'Lo sentimos, no quedan asientos disponibles en este sector.',
      );
    }

    // 4. CREACIÓN DE LA RESERVA
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 15);

    return this.entradasRepository.crear({
      id_usuario: crearEntradaDto.idUsuario,
      id_partido: crearEntradaDto.idPartido,
      id_sector: crearEntradaDto.idSector,
      estado: TicketStatus.RESERVADO,
      fecha_expiracion_reserva: fechaExpiracion.toISOString(),
    });
  }

  async obtenerTodas(): Promise<TicketEntity[]> {
    return this.entradasRepository.obtenerTodas();
  }

  async obtenerUna(id: string): Promise<TicketEntity | null> {
    return this.entradasRepository.obtenerUna(id);
  }

  async marcarComoPagada(id: string): Promise<TicketEntity> {
    return this.entradasRepository.actualizarEstado(id, TicketStatus.PAGADO);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async manejarReservasExpiradas() {
    const ahora = new Date().toISOString();
    const expiradas = await this.entradasRepository.obtenerExpiradas(ahora);

    if (expiradas.length > 0) {
      for (const ticket of expiradas) {
        try {
          // Devolvemos el stock
          await this.entradasRepository.incrementarStock(
            ticket.id_partido,
            ticket.id_sector,
          );

          // Marcamos como CANCELADO
          await this.entradasRepository.actualizarEstado(
            ticket.id,
            TicketStatus.CANCELADO,
          );

          console.log(`[Cron] Reserva ${ticket.id} cancelada por expiración.`);
        } catch (err) {
          console.error(
            `[Cron] Error procesando ticket ${ticket.id}:`,
            err.message,
          );
        }
      }
    }
  }
}

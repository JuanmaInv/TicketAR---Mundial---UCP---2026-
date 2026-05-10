import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CrearEntradaDto } from './dto/create-ticket.dto';
import { TicketEntity } from './entities/ticket.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { PaymentsService } from '../payments/payments.service';
import { PaymentResult } from '../payments/strategies/payment-strategy.interface';
import type { IEntradasRepository } from './repositories/entradas.repository.interface';
import { TicketStateFactory } from './states/ticket-state.factory';
import { QrService } from './qr.service';
import { SectoresService } from '../stadium-sectors/stadium-sectors.service';

@Injectable()
export class EntradasService {
  private readonly logger = new Logger(EntradasService.name);

  constructor(
    @Inject('IEntradasRepository')
    private readonly entradasRepository: IEntradasRepository,
    private readonly ticketStateFactory: TicketStateFactory,
    private readonly paymentsService: PaymentsService,
    private readonly qrService: QrService,
    private readonly sectoresService: SectoresService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crear(crearEntradaDto: CrearEntradaDto): Promise<TicketEntity> {
    const { idUsuario, idPartido, idSector, cantidad } = crearEntradaDto;

    this.logger.log(
      `[Reserva] Inicio — Partido=${idPartido}, Sector=${idSector}, Cantidad=${cantidad}, Usuario=${idUsuario}`,
    );

    // 1. VALIDACIÓN DE PASAPORTE
    const tienePasaporte =
      await this.entradasRepository.validarPasaporteUsuario(idUsuario);
    if (!tienePasaporte) {
      throw new BadRequestException(
        'El usuario debe tener un pasaporte registrado para comprar.',
      );
    }

    // 2. REGLA CRÍTICA: MÁXIMO 6 ENTRADAS POR CUENTA POR PARTIDO
    const LIMITE_ENTRADAS = 6;
    const totalActivas = await this.entradasRepository.contarEntradasActivas(
      idUsuario,
      idPartido,
    );

    if (totalActivas + cantidad > LIMITE_ENTRADAS) {
      throw new ConflictException(
        `Ya tenés ${totalActivas} entradas activas para este partido. ` +
          `Intentás comprar ${cantidad} más, pero el máximo por cuenta es ${LIMITE_ENTRADAS}.`,
      );
    }

    // 3. VERIFICACIÓN DE STOCK
    const stock = await this.entradasRepository.obtenerStockDisponible(
      idPartido,
      idSector,
    );

    if (stock === null) {
      throw new NotFoundException(
        'El sector solicitado no está disponible para este partido.',
      );
    }

    this.logger.log(
      `[Reserva] Stock actual — Sector=${idSector}, StockDisponible=${stock}, CantidadSolicitada=${cantidad}`,
    );

    if (stock < cantidad) {
      throw new ConflictException(
        `No hay suficientes asientos disponibles. Stock: ${stock}, Solicitados: ${cantidad}.`,
      );
    }

    // 4. BUSCAR PRECIO DEL SECTOR DESDE SUPABASE
    const sector = await this.sectoresService.obtenerUno(idSector);
    const precioUnitario = sector.precio;
    const precioTotal = cantidad * precioUnitario;

    this.logger.log(
      `[Reserva] Precio — PrecioUnitario=${precioUnitario} (desde sectores_estadio), PrecioTotal=${precioTotal}`,
    );

    // 5. CREACIÓN DE LA RESERVA
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 15);

    const entrada = await this.entradasRepository.crear({
      id_usuario: idUsuario,
      id_partido: idPartido,
      id_sector: idSector,
      cantidad,
      precio_unitario: precioUnitario,
      precio_total: precioTotal,
      estado: TicketStatus.RESERVADO,
      fecha_expiracion_reserva: fechaExpiracion.toISOString(),
    });

    // 6. DECREMENTAR STOCK
    await this.entradasRepository.decrementarStock(
      idPartido,
      idSector,
      cantidad,
    );

    // 7. RECALCULAR ESTADO DEL PARTIDO
    await this.entradasRepository.recalcularEstadoPartido(idPartido);

    this.logger.log(
      `[Reserva] Completada — EntradaID=${entrada.id}, Cantidad=${cantidad}, Total=${precioTotal}`,
    );

    return entrada;
  }

  async obtenerTodas(): Promise<TicketEntity[]> {
    return this.entradasRepository.obtenerTodas();
  }

  async obtenerUna(id: string): Promise<TicketEntity | null> {
    return this.entradasRepository.obtenerUna(id);
  }

  async marcarComoPagada(
    id: string,
    paymentId?: string,
  ): Promise<TicketEntity> {
    const ticket = await this.entradasRepository.obtenerUna(id);
    if (!ticket) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    // Aplicar Patrón State para validar transición
    const estadoActual = this.ticketStateFactory.create(ticket.estado);
    estadoActual.setContext(ticket);

    // Validamos que el ticket se pueda confirmar (ej: que no esté cancelado o expirado)
    estadoActual.confirmarPago();

    // Guardar payment ID si existe
    if (paymentId) {
      await this.entradasRepository.guardarPaymentId(id, paymentId);
    }

    const ticketPagado = await this.entradasRepository.actualizarEstado(
      id,
      TicketStatus.PAGADO,
    );

    // Emitir evento para que los listeners (ej: NotificationsService) reaccionen
    this.eventEmitter.emit('ticket.pagado', {
      ticketId: ticketPagado.id,
      idUsuario: ticketPagado.idUsuario,
    });
    this.logger.log(
      `Evento 'ticket.pagado' emitido para ticket ${ticketPagado.id}`,
    );

    return ticketPagado;
  }

  /**
   * Genera el código QR de una entrada específica.
   *
   * Regla de negocio: Solo se puede obtener el QR de una entrada PAGADA.
   * Si el ticket está RESERVADO o CANCELADO, se rechaza la solicitud.
   * Esto evita que alguien genere un QR "falso" antes de pagar.
   *
   * @returns Un Data URL en Base64 listo para mostrar como <img> en el frontend.
   */
  async obtenerQr(
    id: string,
  ): Promise<{ ticketId: string; qrDataUrl: string }> {
    const ticket = await this.entradasRepository.obtenerUna(id);
    if (!ticket) {
      throw new NotFoundException(`Entrada ${id} no encontrada.`);
    }

    // Validación de estado: solo entradas PAGADAS tienen QR
    if (ticket.estado !== TicketStatus.PAGADO) {
      throw new BadRequestException(
        `El QR solo está disponible para entradas pagadas. Estado actual: ${ticket.estado}.`,
      );
    }

    const qrDataUrl = await this.qrService.generarQrBase64(ticket.id);
    return { ticketId: ticket.id, qrDataUrl };
  }

  async pagar(
    id: string,
  ): Promise<{ ticket: TicketEntity; paymentResult: PaymentResult }> {
    const ticket = await this.entradasRepository.obtenerUna(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} no encontrado.`);
    }

    const estado = this.ticketStateFactory.create(ticket.estado);
    estado.setContext(ticket);

    // Usamos precioUnitario y cantidad del ticket (calculados al reservar)
    this.logger.log(
      `[Pago] Ticket=${id}, Cantidad=${ticket.cantidad}, PrecioUnitario=${ticket.precioUnitario}, PrecioTotal=${ticket.precioTotal}`,
    );

    // El estado procesa el pago usando el servicio de pagos (Strategy)
    const paymentResult = await estado.pagar(
      this.paymentsService,
      ticket.precioUnitario,
      ticket.cantidad,
    );

    // Si NO hay paymentUrl y el pago fue exitoso, es un pago inmediato (Simulado)
    if (!paymentResult.paymentUrl && paymentResult.success) {
      const ticketPagado = await this.entradasRepository.actualizarEstado(
        id,
        TicketStatus.PAGADO,
      );

      // Emitir evento para que los listeners (ej: NotificationsService) reaccionen
      this.eventEmitter.emit('ticket.pagado', {
        ticketId: ticketPagado.id,
        idUsuario: ticketPagado.idUsuario,
      });
      this.logger.log(
        `Evento 'ticket.pagado' emitido para ticket ${ticketPagado.id}`,
      );

      return { ticket: ticketPagado, paymentResult };
    }

    // Si HAY paymentUrl (Mercado Pago), el ticket sigue RESERVADO hasta que el webhook confirme
    return { ticket, paymentResult };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async manejarReservasExpiradas() {
    const ahora = new Date().toISOString();
    const expiradas = await this.entradasRepository.obtenerExpiradas(ahora);

    if (expiradas.length > 0) {
      for (const row of expiradas) {
        try {
          // Mapeamos a entidad para tener el contexto completo
          const ticket = await this.entradasRepository.obtenerUna(row.id);
          if (!ticket) continue;

          // Validar con el patrón State antes de cancelar
          const estadoActual = this.ticketStateFactory.create(ticket.estado);
          estadoActual.setContext(ticket);
          estadoActual.cancelar();

          // Devolvemos el stock
          await this.entradasRepository.incrementarStock(
            ticket.idPartido,
            ticket.idSector,
            ticket.cantidad,
          );

          // Marcamos como CANCELADO
          await this.entradasRepository.actualizarEstado(
            ticket.id,
            TicketStatus.CANCELADO,
          );

          // Recalcular estado del partido
          await this.entradasRepository.recalcularEstadoPartido(
            ticket.idPartido,
          );
        } catch (err) {
          this.logger.error(
            `[Cron] Error procesando ticket ${row.id}:`,
            (err as Error).message,
          );
        }
      }
    }
  }

  /**
   * Cancela una reserva y devuelve el stock.
   */
  async cancelar(id: string): Promise<TicketEntity> {
    const ticket = await this.entradasRepository.obtenerUna(id);
    if (!ticket) {
      throw new NotFoundException(`Entrada ${id} no encontrada.`);
    }

    // Validar con patrón State
    const estadoActual = this.ticketStateFactory.create(ticket.estado);
    estadoActual.setContext(ticket);
    estadoActual.cancelar();

    // Marcar como cancelado
    const ticketCancelado = await this.entradasRepository.actualizarEstado(
      id,
      TicketStatus.CANCELADO,
    );

    // Devolver stock
    await this.entradasRepository.incrementarStock(
      ticket.idPartido,
      ticket.idSector,
      ticket.cantidad,
    );

    // Recalcular estado del partido
    await this.entradasRepository.recalcularEstadoPartido(ticket.idPartido);

    this.logger.log(
      `[Cancelación] Entrada ${id} cancelada. Stock devuelto: ${ticket.cantidad}`,
    );

    return ticketCancelado;
  }
}

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
import { PaymentsService } from '../payments/payments.service';
import { PaymentResult } from '../payments/strategies/payment-strategy.interface';
import type { IEntradasRepository } from './repositories/entradas.repository.interface';
import { TicketStateFactory } from './states/ticket-state.factory';
import { QrService } from './qr.service';
import { SectoresService } from '../stadium-sectors/stadium-sectors.service';

interface TicketExpirado {
  id: string;
  id_partido: string;
  id_sector: string;
  estado: TicketStatus;
}

@Injectable()
export class EntradasService {
  constructor(
    @Inject('IEntradasRepository')
    private readonly entradasRepository: IEntradasRepository,
    private readonly ticketStateFactory: TicketStateFactory,
    private readonly paymentsService: PaymentsService,
    private readonly qrService: QrService,
    private readonly sectoresService: SectoresService,
  ) { }

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

    // 2. REGLA CRÍTICA: MÁXIMO 6 ENTRADAS POR CUENTA DE USUARIO POR PARTIDO
    // Un usuario puede comprar hasta 6 entradas en nombre de su cuenta para un mismo partido.
    // Todas las entradas quedan a nombre del titular que presenta su pasaporte en la puerta.
    const LIMITE_ENTRADAS = 6;
    const totalActivas = await this.entradasRepository.contarEntradasActivas(
      crearEntradaDto.idUsuario,
      crearEntradaDto.idPartido,
    );
    if (totalActivas >= LIMITE_ENTRADAS) {
      throw new ConflictException(
        `Ya tenés ${totalActivas} entradas activas para este partido. El máximo permitido por cuenta es ${LIMITE_ENTRADAS} por partido.`,
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
    const ticket = await this.entradasRepository.obtenerUna(id);
    if (!ticket) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    // Aplicar Patrón State para validar transición
    const estadoActual = this.ticketStateFactory.create(ticket.estado);
    estadoActual.setContext(ticket);

    // Validamos que el ticket se pueda confirmar (ej: que no esté cancelado o expirado)
    estadoActual.confirmarPago();

    return this.entradasRepository.actualizarEstado(id, TicketStatus.PAGADO);
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

    // Obtenemos el precio real del sector desde el repositorio de sectores
    const sector = await this.sectoresService.obtenerUno(ticket.idSector);
    const precioFinal = sector.precio;

    // El estado procesa el pago usando el servicio de pagos (Strategy)
    const paymentResult = await estado.pagar(this.paymentsService, precioFinal);

    // Si NO hay paymentUrl y el pago fue exitoso, es un pago inmediato (Simulado)
    if (!paymentResult.paymentUrl && paymentResult.success) {
      const ticketPagado = await this.entradasRepository.actualizarEstado(
        id,
        TicketStatus.PAGADO,
      );
      return { ticket: ticketPagado, paymentResult };
    }

    // Si HAY paymentUrl (Mercado Pago), el ticket sigue RESERVADO hasta que el webhook confirme
    return { ticket, paymentResult };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async manejarReservasExpiradas() {
    const ahora = new Date().toISOString();
    const expiradas = (await this.entradasRepository.obtenerExpiradas(
      ahora,
    )) as TicketExpirado[];

    if (expiradas && expiradas.length > 0) {
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
          );

          // Marcamos como CANCELADO
          await this.entradasRepository.actualizarEstado(
            ticket.id,
            TicketStatus.CANCELADO,
          );
        } catch (err) {
          console.error(
            `[Cron] Error procesando ticket ${row.id}:`,
            (err as Error).message,
          );
        }
      }
    }
  }
}

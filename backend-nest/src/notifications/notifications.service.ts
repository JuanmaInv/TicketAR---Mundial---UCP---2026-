import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QrService } from '../tickets/qr.service';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly qrService: QrService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @OnEvent('ticket.pagado')
  async handleTicketPagado(payload: { ticketId: string; idUsuario: string }) {
    this.logger.log(
      `Evento 'ticket.pagado' recibido. Ticket: ${payload.ticketId}, Usuario: ${payload.idUsuario}`,
    );

    try {
      const usuario = await this.usuariosService.buscarPorId(payload.idUsuario);
      if (!usuario) {
        this.logger.warn(
          `Usuario ${payload.idUsuario} no encontrado. No se puede enviar el QR.`,
        );
        return;
      }

      const qrDataUrl = await this.qrService.generarQrBase64(payload.ticketId);
      const qrBase64Length = qrDataUrl.length;
      this.logger.log(
        `Notificacion local registrada para ${usuario.email}. Ticket ${payload.ticketId}, QR generado (${qrBase64Length} chars).`,
      );
    } catch (error) {
      this.logger.error(
        `Error al procesar notificacion para ticket ${payload.ticketId}`,
        (error as Error).message,
      );
    }
  }
}

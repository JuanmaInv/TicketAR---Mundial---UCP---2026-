import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { QrService } from '../tickets/qr.service';
import { UsuariosService } from '../usuarios/usuarios.service';

/**
 * Servicio de Notificaciones - Listener del evento 'ticket.pagado'.
 *
 * Este servicio implementa el lado "Observador" del Patrón Observer
 * usando el EventEmitter nativo de NestJS.
 *
 * Cuando EntradasService emite 'ticket.pagado', este servicio:
 * 1. Busca los datos del usuario (email, nombre).
 * 2. Genera el código QR con el UUID del ticket.
 * 3. Envía un correo electrónico con el QR incrustado.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly qrService: QrService,
    private readonly usuariosService: UsuariosService,
    private readonly configService: ConfigService,
  ) {
    // Configurar el transporter de Nodemailer con las variables de entorno
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  /**
   * Listener del evento 'ticket.pagado'.
   * Se ejecuta automáticamente cada vez que EntradasService emite este evento.
   *
   * El decorador @OnEvent convierte este método en un "Observador" sin necesidad
   * de inyectar dependencias manualmente ni mantener listas de suscriptores.
   */
  @OnEvent('ticket.pagado')
  async handleTicketPagado(payload: { ticketId: string; idUsuario: string }) {
    this.logger.log(
      `Evento 'ticket.pagado' recibido. Ticket: ${payload.ticketId}, Usuario: ${payload.idUsuario}`,
    );

    try {
      // 1. Buscar los datos del usuario para obtener su email
      const usuario = await this.usuariosService.buscarPorId(payload.idUsuario);
      if (!usuario) {
        this.logger.warn(
          `Usuario ${payload.idUsuario} no encontrado. No se puede enviar el QR.`,
        );
        return;
      }

      // 2. Generar el código QR en Base64
      const qrDataUrl = await this.qrService.generarQrBase64(payload.ticketId);

      // 3. Extraer la imagen Base64 pura (sin el prefijo "data:image/png;base64,")
      const base64Image = qrDataUrl.replace(/^data:image\/png;base64,/, '');

      // 4. Enviar el correo con el QR incrustado
      await this.transporter.sendMail({
        from: `"TicketAR - Mundial 2026 🏟️" <${this.configService.get('MAIL_USER')}>`,
        to: usuario.email,
        subject: `🎟️ ¡Tu entrada está confirmada! - Ticket ${payload.ticketId.substring(0, 8)}`,
        html: this.buildEmailHtml(usuario.nombre, payload.ticketId),
        attachments: [
          {
            filename: `entrada-${payload.ticketId.substring(0, 8)}.png`,
            content: base64Image,
            encoding: 'base64',
            cid: 'ticket_qr', // Content-ID para incrustar en el HTML
          },
        ],
      });

      this.logger.log(`Correo con QR enviado exitosamente a ${usuario.email}`);
    } catch (error) {
      // El envío de mail NO debe romper el flujo principal de pago
      this.logger.error(
        `Error al procesar notificación para ticket ${payload.ticketId}`,
        (error as Error).message,
      );
    }
  }

  /**
   * Construye el HTML del correo electrónico con el QR incrustado.
   * El QR se referencia mediante el Content-ID "cid:ticket_qr".
   */
  private buildEmailHtml(nombreUsuario: string, ticketId: string): string {
    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏟️ TicketAR - Mundial 2026</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Tu entrada ha sido confirmada</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Hola <strong>${nombreUsuario}</strong>,</p>
          <p style="font-size: 14px; color: #555;">Tu pago fue procesado con éxito. A continuación encontrarás tu código QR de ingreso:</p>
          <div style="text-align: center; margin: 25px 0; padding: 20px; background: #f0f4ff; border-radius: 8px;">
            <img src="cid:ticket_qr" alt="Código QR de entrada" style="width: 250px; height: 250px;" />
            <p style="font-size: 12px; color: #888; margin-top: 10px;">ID: ${ticketId}</p>
          </div>
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              <strong>⚠️ Importante:</strong> Presentá tu pasaporte en la puerta del estadio junto con este QR. 
              El titular de la cuenta es responsable de validar el ingreso de todo el grupo (máx. 6 entradas).
            </p>
          </div>
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
            Este correo fue generado automáticamente por TicketAR. No respondas a este mensaje.
          </p>
        </div>
      </div>
    `;
  }
}

import {
  Controller,
  Post,
  Body,
  Query,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { EntradasService } from '../tickets/tickets.service';
import { MercadoPagoStrategy } from './strategies/mercadopago.strategy';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    @Inject(forwardRef(() => EntradasService))
    private readonly entradasService: EntradasService,
    private readonly mercadopagoStrategy: MercadoPagoStrategy,
  ) {}

  /**
   * Endpoint para recibir notificaciones asíncronas (Webhooks) de Mercado Pago.
   * Maneja actualizaciones de pagos y activa la transición de estado de los tickets.
   */
  @Post('webhook')
  async handleWebhook(
    @Query('id') id: string, // MP envía el ID a veces por Query String
    @Query('topic') topic: string,
    @Body() body: MPWebhookBody, // Y a veces dentro del Body
  ) {
    this.logger.log(`Webhook recibido: Topic=${topic}, ID=${id}`);

    // Mercado Pago envía notificaciones de diferentes tipos (payment, merchant_order, etc.)
    const resourceId = id || body.data?.id;
    const action = body.action || topic;

    // Solo procesamos eventos de pago
    if (
      action === 'payment.updated' ||
      action === 'payment.created' ||
      topic === 'payment'
    ) {
      if (!resourceId) {
        this.logger.warn('Webhook recibido sin resourceId');
        return { received: true };
      }

      this.logger.log(`Verificando pago de Mercado Pago: ${resourceId}`);

      // Verificamos el estado real del pago con MP
      const result = await this.mercadopagoStrategy.verifyPayment(resourceId);

      if (result.success && result.paymentUrl) {
        const ticketId = result.paymentUrl; // El ticketId viene en external_reference
        this.logger.log(
          `Pago aprobado para Ticket ${ticketId}. Actualizando estado...`,
        );

        try {
          await this.entradasService.marcarComoPagada(ticketId, resourceId);
          this.logger.log(
            `Ticket ${ticketId} marcado como pagado exitosamente.`,
          );
        } catch (error) {
          this.logger.error(
            `Error al marcar ticket ${ticketId} como pagado`,
            error,
          );
        }
      } else {
        this.logger.log(
          `El pago ${resourceId} no está aprobado o no tiene ticketId vinculado. Resultado: ${result.error || 'N/A'}`,
        );
      }
    }

    return { received: true };
  }
}

interface MPWebhookBody {
  action?: string;
  data?: {
    id?: string;
  };
}

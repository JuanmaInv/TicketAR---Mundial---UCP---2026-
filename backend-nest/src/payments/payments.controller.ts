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

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    @Inject(forwardRef(() => EntradasService))
    private readonly entradasService: EntradasService,
  ) {}

  @Post('webhook')
  handleWebhook(
    @Query('id') id: string,
    @Query('topic') topic: string,
    @Body() body: MPWebhookBody,
  ) {
    this.logger.log(`Webhook recibido: Topic=${topic}, ID=${id}`);

    // Mercado Pago envía notificaciones de diferentes tipos.
    // Aquí nos interesa cuando un pago es actualizado.

    // Nota: MP envía el ID del recurso (pago o merchant_order)
    // Para simplificar, asumiremos que recibimos el aviso y validamos el estado.

    const resourceId = id || body.data?.id;
    const action = body.action || topic;

    if (action === 'payment.updated' || topic === 'payment') {
      this.logger.log(`Procesando pago de Mercado Pago: ${resourceId}`);

      // En un entorno real, aquí llamaríamos a la API de MP para verificar el estado del pago
      // y obtendríamos el external_reference (ticketId).

      // Por ahora, simularemos que encontramos el ticketId vinculado.
      // (En la estrategia real enviamos metadata.ticketId como external_reference)
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

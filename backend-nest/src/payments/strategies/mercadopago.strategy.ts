import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

@Injectable()
export class MercadoPagoStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(MercadoPagoStrategy.name);
  private readonly client: MercadoPagoConfig;

  constructor(private readonly configService: ConfigService) {
    // Inicializamos el cliente con el token del .env
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');

    if (!accessToken) {
      this.logger.error(
        'MP_ACCESS_TOKEN no encontrado en las variables de entorno',
      );
    }

    this.client = new MercadoPagoConfig({
      accessToken: accessToken || '',
      options: { timeout: 5000 },
    });
  }

  /**
   * Genera una preferencia de pago en Mercado Pago (Checkout Pro).
   * @param amount Monto a cobrar.
   * @param currency Moneda (ARS/USD).
   * @param metadata Datos adicionales, incluyendo el ticketId para trazabilidad.
   * @returns Resultado con la URL de redirección para el usuario.
   */
  async processPayment(
    amount: number,
    currency: string,
    metadata?: { ticketId: string },
  ): Promise<PaymentResult> {
    try {
      this.logger.log(
        `Generando preferencia de Mercado Pago por ${amount} ${currency} para ticket ${metadata?.ticketId}`,
      );

      const preference = new Preference(this.client);

      const response = await preference.create({
        body: {
          items: [
            {
              id: metadata?.ticketId || 'ticket_generic',
              title: 'Entrada Mundial 2026 - TicketAR',
              quantity: 1,
              unit_price: amount,
              currency_id: currency === 'USD' ? 'USD' : 'ARS',
            },
          ],
          external_reference: metadata?.ticketId,
          notification_url: this.configService.get<string>('MP_WEBHOOK_URL'), // URL que recibirá los avisos
          // En desarrollo usamos la URL base del webhook (ngrok) para back_urls
          // ya que MP exige HTTPS para auto_return
          ...this.buildBackUrls(),
        },
      });

      this.logger.log(`✅ Preferencia creada exitosamente. ID: ${response.id}`);
      this.logger.log(`🔗 LINK DE PAGO: ${response.init_point}`);

      return {
        success: true,
        paymentUrl: response.init_point!,
        transactionId: response.id,
      };
    } catch (error) {
      this.logger.error('Error al crear preferencia de Mercado Pago', error);
      return {
        success: false,
        error: 'No se pudo inicializar el pago con Mercado Pago',
      };
    }
  }

  /**
   * Verifica el estado real de un pago contra la API de Mercado Pago.
   * Este método es utilizado principalmente por el Webhook para confirmar transacciones.
   * @param transactionId ID de la transacción enviado por el Webhook de MP.
   */
  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    // FIX (HIGH): El bypass se evalúa ANTES de llamar a la API externa.
    // Si E2E_BYPASS está activo y no estamos en producción, retornamos éxito
    // inmediatamente sin contactar a Mercado Pago, evitando fallos por tokens inválidos
    // y garantizando que el bypass cumpla su propósito en entornos de testing.
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.E2E_BYPASS === 'true'
    ) {
      this.logger.warn(
        `[E2E_BYPASS] Verificación de pago omitida para transacción ${transactionId} (entorno no productivo)`,
      );
      return {
        success: true,
        transactionId,
        paymentUrl: undefined,
      };
    }

    try {
      this.logger.log(
        `Verificando estado del pago ${transactionId} en Mercado Pago`,
      );

      const payment = new Payment(this.client);
      const response = await payment.get({ id: transactionId });

      const isApproved = response.status === 'approved';

      return {
        success: isApproved,
        transactionId: response.id?.toString(),
        // Importante: Guardamos el ticketId que enviamos en external_reference
        error: isApproved ? undefined : `Estado del pago: ${response.status}`,
        // Hack temporal para pasar el ticketId de vuelta al controlador
        paymentUrl: response.external_reference,
      };
    } catch (error) {
      this.logger.error(`Error al verificar pago ${transactionId}`, error);
      return {
        success: false,
        error: 'No se pudo verificar el pago con Mercado Pago',
      };
    }
  }

  /**
   * Construye las back_urls y auto_return para la preferencia de MP.
   * Si FRONTEND_URL es HTTPS (producción), la usa directamente.
   * Si no (localhost/dev), usa la base del webhook (ngrok) como fallback.
   */
  private buildBackUrls(): Record<string, unknown> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || '';
    const webhookUrl = this.configService.get<string>('MP_WEBHOOK_URL') || '';

    let baseUrl: string;

    if (frontendUrl.startsWith('https://')) {
      baseUrl = frontendUrl;
    } else if (webhookUrl) {
      // Extraer base del webhook: https://xxx.ngrok-free.dev
      try {
        const parsed = new URL(webhookUrl);
        baseUrl = `${parsed.protocol}//${parsed.host}`;
      } catch {
        baseUrl = '';
      }
    } else {
      baseUrl = '';
    }

    if (!baseUrl) {
      // Sin URLs válidas, no incluimos back_urls ni auto_return
      return {};
    }

    return {
      back_urls: {
        success: `${baseUrl}/pago-exitoso`,
        failure: `${baseUrl}/pago-fallido`,
        pending: `${baseUrl}/pago-pendiente`,
      },
      auto_return: 'approved',
    };
  }
}

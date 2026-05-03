import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

@Injectable()
export class MercadoPagoStrategy implements IPaymentStrategy {
    private readonly logger = new Logger(MercadoPagoStrategy.name);
    private readonly client: MercadoPagoConfig;

    constructor(private readonly configService: ConfigService) {
        // Inicializamos el cliente con el token del .env
        const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');

        if (!accessToken) {
            this.logger.error('MP_ACCESS_TOKEN no encontrado en las variables de entorno');
        }

        this.client = new MercadoPagoConfig({
            accessToken: accessToken || '',
            options: { timeout: 5000 },
        });
    }

    // Parametros (Crea una preferencia de MP)
    async processPayment(
        amount: number,
        currency: string,
        metadata?: { ticketId: string }
    ): Promise<PaymentResult> {
        try {
            this.logger.log(`Generando preferencia de Mercado Pago por ${amount} ${currency} para ticket ${metadata?.ticketId}`);

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
                        }
                    ],
                    external_reference: metadata?.ticketId,
                    notification_url: this.configService.get<string>('MP_WEBHOOK_URL'), // URL que recibirá los avisos
                    back_urls: {
                        success: `${this.configService.get<string>('FRONTEND_URL')}/pago-exitoso`,
                        failure: `${this.configService.get<string>('FRONTEND_URL')}/pago-fallido`,
                        pending: `${this.configService.get<string>('FRONTEND_URL')}/pago-pendiente`,
                    },
                    auto_return: 'approved',
                }
            });

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
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentStrategy,
  PaymentResult,
} from './strategies/payment-strategy.interface';
import { MercadoPagoStrategy } from './strategies/mercadopago.strategy';
import { SimulatedPaymentStrategy } from './strategies/simulated-payment.strategy';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private strategy: IPaymentStrategy;

  constructor(
    private readonly simulatedStrategy: SimulatedPaymentStrategy,
    private readonly mercadopagoStrategy: MercadoPagoStrategy,
    private readonly configService: ConfigService,
  ) {
    const useMp = this.configService.get<string>('MP_ACCESS_TOKEN');
    // Si tenemos token de MP, usamos la estrategia real, sino la simulada
    this.strategy = useMp ? this.mercadopagoStrategy : this.simulatedStrategy;
  }

  /**
   * Cambia la estrategia de pago dinámicamente
   * @param provider - 'simulated' o 'mercadopago'
   */
  useProvider(provider: 'simulated' | 'mercadopago') {
    if (provider === 'mercadopago') {
      this.strategy = this.mercadopagoStrategy;
    } else {
      this.strategy = this.simulatedStrategy;
    }
  }

  async processTicketPayment(
    amount: number,
    ticketId: string,
  ): Promise<PaymentResult> {
    this.logger.log(
      `Iniciando procesamiento de pago por ${amount} ARS (Ticket: ${ticketId})`,
    );
    return this.strategy.processPayment(amount, 'ARS', { ticketId });
  }

  /**
   * Verifica el estado de un pago usando la estrategia configurada.
   * @param transactionId ID único de la transacción.
   */
  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return this.strategy.verifyPayment(transactionId);
  }
}

import { Injectable, Logger } from '@nestjs/common';
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
  ) {
    // Por defecto usamos la simulada
    this.strategy = simulatedStrategy;
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

import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

@Injectable()
export class SimulatedPaymentStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(SimulatedPaymentStrategy.name);

  async processPayment(
    amount: number,
    currency: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata?: { ticketId: string },
  ): Promise<PaymentResult> {
    this.logger.log(`Procesando pago simulado de ${amount} ${currency}...`);

    // Simulamos una demora de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Por defecto, siempre aprobamos el pago para la demo
    return {
      success: true,
      transactionId: `SIM-${randomUUID().replace(/-/g, '').slice(0, 9).toUpperCase()}`,
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    this.logger.log(`Verificando pago simulado ${transactionId}...`);
    await Promise.resolve();
    return {
      success: true,
      transactionId,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

@Injectable()
export class SimulatedPaymentStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(SimulatedPaymentStrategy.name);

  async processPayment(
    amount: number,
    currency: string,
  ): Promise<PaymentResult> {
    this.logger.log(`Procesando pago simulado de ${amount} ${currency}...`);

    // Simulamos una demora de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Por defecto, siempre aprobamos el pago para la demo
    return {
      success: true,
      transactionId: `SIM-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

@Injectable()
export class SimulatedPaymentStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(SimulatedPaymentStrategy.name);

  async processPayment(
    unitPrice: number,
    cantidad: number,
    currency: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata?: { ticketId: string },
  ): Promise<PaymentResult> {
    const total = unitPrice * cantidad;
    this.logger.log(
      `Procesando pago simulado: UnitPrice=${unitPrice}, Cantidad=${cantidad}, Total=${total} ${currency}...`,
    );

    // Simulamos una demora de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Por defecto, siempre aprobamos el pago para la demo
    return {
      success: true,
      transactionId: `SIM-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
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

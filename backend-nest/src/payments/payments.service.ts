import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentStrategy,
  PaymentResult,
} from './strategies/payment-strategy.interface';
import { SimulatedPaymentStrategy } from './strategies/simulated-payment.strategy';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private strategy: IPaymentStrategy;

  constructor(private readonly simulatedStrategy: SimulatedPaymentStrategy) {
    // Por defecto usamos la simulada
    this.strategy = simulatedStrategy;
  }

  setStrategy(strategy: IPaymentStrategy) {
    this.strategy = strategy;
  }

  async processTicketPayment(amount: number): Promise<PaymentResult> {
    this.logger.log(`Iniciando procesamiento de pago por valor de ${amount}`);
    return this.strategy.processPayment(amount, 'ARS');
  }
}

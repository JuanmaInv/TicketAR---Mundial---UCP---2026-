import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SimulatedPaymentStrategy } from './strategies/simulated-payment.strategy';

@Module({
  providers: [PaymentsService, SimulatedPaymentStrategy],
  exports: [PaymentsService],
})
export class PagosModule {}

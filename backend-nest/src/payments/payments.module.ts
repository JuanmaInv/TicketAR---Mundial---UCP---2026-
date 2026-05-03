import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MercadoPagoStrategy } from './strategies/mercadopago.strategy';
import { SimulatedPaymentStrategy } from './strategies/simulated-payment.strategy';
import { EntradasModule } from '../tickets/tickets.module';

@Module({
  imports: [forwardRef(() => EntradasModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoStrategy, SimulatedPaymentStrategy],
  exports: [PaymentsService],
})
export class PagosModule {}

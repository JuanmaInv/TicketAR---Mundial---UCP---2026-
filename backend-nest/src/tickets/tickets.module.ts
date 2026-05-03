import { Module, forwardRef } from '@nestjs/common';
import { EntradasController } from './tickets.controller';
import { EntradasService } from './tickets.service';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { TicketStateFactory } from './states/ticket-state.factory';
import { PagosModule } from '../payments/payments.module';
import { SupabaseEntradasRepository } from './repositories/supabase-entradas.repository';
import { ReservasExpiradasService } from './reservas-expiradas.service';
import { QrService } from './qr.service';

@Module({
  imports: [SupabaseModule, UsuariosModule, forwardRef(() => PagosModule)],
  controllers: [EntradasController],
  providers: [
    EntradasService,
    TicketStateFactory,
    // Servicio de generación de códigos QR para entradas pagadas
    QrService,
    SupabaseEntradasRepository,
    {
      provide: 'IEntradasRepository',
      useClass: SupabaseEntradasRepository,
    },
    // Servicio del Cron Job que libera reservas vencidas cada minuto
    ReservasExpiradasService,
  ],
  exports: [EntradasService],
})
export class EntradasModule {}

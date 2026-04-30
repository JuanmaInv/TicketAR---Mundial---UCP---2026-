import { Module } from '@nestjs/common';
import { EntradasController } from './tickets.controller';
import { EntradasService } from './tickets.service';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { TicketStateFactory } from './states/ticket-state.factory';
import { PagosModule } from '../payments/payments.module';
import { SupabaseEntradasRepository } from './repositories/supabase-entradas.repository';

@Module({
  imports: [SupabaseModule, UsuariosModule, PagosModule],
  controllers: [EntradasController],
  providers: [
    EntradasService,
    TicketStateFactory,
    {
      provide: 'IEntradasRepository',
      useClass: SupabaseEntradasRepository,
    },
  ],
  exports: [EntradasService],
})
export class EntradasModule {}

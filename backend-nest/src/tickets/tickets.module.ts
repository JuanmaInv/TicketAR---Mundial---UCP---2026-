import { Module } from '@nestjs/common';
import { EntradasController } from './tickets.controller';
import { EntradasService } from './tickets.service';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { SupabaseEntradasRepository } from './repositories/supabase-entradas.repository';

@Module({
  imports: [SupabaseModule, UsuariosModule],
  controllers: [EntradasController],
  providers: [
    EntradasService,
    {
      provide: 'IEntradasRepository',
      useClass: SupabaseEntradasRepository,
    },
  ],
  exports: [EntradasService],
})
export class EntradasModule {}

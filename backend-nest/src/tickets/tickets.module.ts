import { Module } from '@nestjs/common';
import { EntradasController } from './tickets.controller';
import { EntradasService } from './tickets.service';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [SupabaseModule, UsuariosModule],
  controllers: [EntradasController],
  providers: [EntradasService],
  exports: [EntradasService],
})
export class EntradasModule {}

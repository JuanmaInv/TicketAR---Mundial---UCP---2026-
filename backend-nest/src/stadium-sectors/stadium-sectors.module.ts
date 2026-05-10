import { Module } from '@nestjs/common';
import { SectoresService } from './stadium-sectors.service';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { SectoresController } from './stadium-sectors.controller';
import { SupabaseSectoresRepository } from './repositories/supabase-stadium-sectors.repository';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [SupabaseModule, UsuariosModule],
  controllers: [SectoresController],
  providers: [
    SectoresService,
    {
      provide: 'ISectoresRepository',
      useClass: SupabaseSectoresRepository,
    },
  ],
  exports: [SectoresService],
})
export class SectoresModule {}

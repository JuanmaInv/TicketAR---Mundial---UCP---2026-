import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { SupabaseUsuariosRepository } from './repositories/supabase-usuarios.repository';

@Module({
  imports: [SupabaseModule],
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    {
      provide: 'IUsuariosRepository',
      useClass: SupabaseUsuariosRepository,
    },
  ],
  exports: [UsuariosService],
})
export class UsuariosModule {}

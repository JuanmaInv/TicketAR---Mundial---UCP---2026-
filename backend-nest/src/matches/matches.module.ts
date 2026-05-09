import { Module } from '@nestjs/common';
import { PartidosService } from './matches.service';
import { PartidosController } from './matches.controller';
import { SupabasePartidosRepository } from './repositories/supabase-matches.repository';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule],
  controllers: [PartidosController],
  providers: [
    PartidosService,
    {
      provide: 'IPartidosRepository',
      useClass: SupabasePartidosRepository,
    },
  ],
  exports: [PartidosService],
})
export class PartidosModule {}

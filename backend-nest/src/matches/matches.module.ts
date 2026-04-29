import { Module } from '@nestjs/common';
import { PartidosService } from './matches.service';
import { PartidosController } from './matches.controller';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { SupabasePartidosRepository } from './repositories/supabase-matches.repository';

@Module({
  imports: [SupabaseModule],
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

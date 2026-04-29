import { Module } from '@nestjs/common';
import { SectoresController } from './stadium-sectors.controller';
import { SectoresService } from './stadium-sectors.service';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { SupabaseSectoresRepository } from './repositories/supabase-sectores.repository';

@Module({
  imports: [SupabaseModule],
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

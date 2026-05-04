import { Module } from '@nestjs/common';
import { SectoresService } from './stadium-sectors.service';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { SectoresController } from './stadium-sectors.controller';
import { SupabaseSectoresRepository } from './repositories/supabase-stadium-sectors.repository';

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

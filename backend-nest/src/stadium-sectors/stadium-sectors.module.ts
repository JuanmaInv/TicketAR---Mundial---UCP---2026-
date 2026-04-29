import { Module } from '@nestjs/common';
import { SectoresService } from './stadium-sectors.service';
import { SectoresController } from './stadium-sectors.controller';
import { SupabaseSectoresRepository } from './repositories/supabase-stadium-sectors.repository';

@Module({
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

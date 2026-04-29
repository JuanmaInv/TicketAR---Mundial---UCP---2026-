import { Module } from '@nestjs/common';
import { SectoresService } from './stadium-sectors.service';
<<<<<<< Updated upstream
import { SupabaseModule } from '../common/supabase/supabase.module';
import { SupabaseSectoresRepository } from './repositories/supabase-sectores.repository';
=======
import { SectoresController } from './stadium-sectors.controller';
import { SupabaseSectoresRepository } from './repositories/supabase-stadium-sectors.repository';
>>>>>>> Stashed changes

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

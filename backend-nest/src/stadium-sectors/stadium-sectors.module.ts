import { Module } from '@nestjs/common';
import { SectoresController } from './stadium-sectors.controller';
import { SectoresService } from './stadium-sectors.service';

@Module({
  controllers: [SectoresController],
  providers: [SectoresService],
  exports: [SectoresService],
})
export class SectoresModule {}

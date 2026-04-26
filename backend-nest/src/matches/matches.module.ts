import { Module } from '@nestjs/common';
import { PartidosController } from './matches.controller';
import { PartidosService } from './matches.service';

@Module({
  controllers: [PartidosController],
  providers: [PartidosService],
  exports: [PartidosService],
})
export class PartidosModule {}

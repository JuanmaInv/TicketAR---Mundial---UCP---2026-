import { Module } from '@nestjs/common';
import { EntradasController } from './tickets.controller';
import { EntradasService } from './tickets.service';

@Module({
  controllers: [EntradasController],
  providers: [EntradasService],
  exports: [EntradasService],
})
export class EntradasModule {}

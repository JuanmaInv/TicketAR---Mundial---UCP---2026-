import { Module } from '@nestjs/common';
import { CredencialesController } from './passport-credentials.controller';
import { CredencialesService } from './passport-credentials.service';

@Module({
  controllers: [CredencialesController],
  providers: [CredencialesService],
  exports: [CredencialesService],
})
export class CredencialesPasaporteModule {}

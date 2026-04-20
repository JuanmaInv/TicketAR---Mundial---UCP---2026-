import { Module } from '@nestjs/common';
import { PassportCredentialsController } from './passport-credentials.controller';
import { PassportCredentialsService } from './passport-credentials.service';

@Module({
  controllers: [PassportCredentialsController],
  providers: [PassportCredentialsService],
})
export class PassportCredentialsModule {}

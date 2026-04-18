import { Module } from '@nestjs/common';
import { StadiumSectorsController } from './stadium-sectors.controller';
import { StadiumSectorsService } from './stadium-sectors.service';

@Module({
  controllers: [StadiumSectorsController],
  providers: [StadiumSectorsService]
})
export class StadiumSectorsModule {}

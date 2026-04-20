import { Module } from '@nestjs/common';
import { StadiumSectorsController } from './stadium-sectors.controller';
import { StadiumSectorsService } from './stadium-sectors.service';

@Module({
  controllers: [StadiumSectorsController],
<<<<<<< Updated upstream
  providers: [StadiumSectorsService]
=======
  providers: [StadiumSectorsService],
  exports: [StadiumSectorsService],
>>>>>>> Stashed changes
})
export class StadiumSectorsModule {}

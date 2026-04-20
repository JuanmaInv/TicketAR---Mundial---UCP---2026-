import { Test, TestingModule } from '@nestjs/testing';
import { StadiumSectorsService } from './stadium-sectors.service';

describe('StadiumSectorsService', () => {
  let service: StadiumSectorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StadiumSectorsService],
    }).compile();

    service = module.get<StadiumSectorsService>(StadiumSectorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

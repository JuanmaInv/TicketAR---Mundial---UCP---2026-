import { Test, TestingModule } from '@nestjs/testing';
import { StadiumSectorsController } from './stadium-sectors.controller';

describe('StadiumSectorsController', () => {
  let controller: StadiumSectorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StadiumSectorsController],
    }).compile();

    controller = module.get<StadiumSectorsController>(StadiumSectorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

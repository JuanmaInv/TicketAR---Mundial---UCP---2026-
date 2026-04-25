import { Test, TestingModule } from '@nestjs/testing';
import { SectoresController } from './stadium-sectors.controller';
import { SectoresService } from './stadium-sectors.service';

describe('SectoresController', () => {
  let controller: SectoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectoresController],
      providers: [SectoresService],
    }).compile();

    controller = module.get(SectoresController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});

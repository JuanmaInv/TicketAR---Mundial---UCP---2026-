import { Test, TestingModule } from '@nestjs/testing';
import { SectoresController } from './stadium-sectors.controller';

describe('SectoresController', () => {
  let controller: SectoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectoresController],
    }).compile();

    controller = module.get(SectoresController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});

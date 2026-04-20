import { Test, TestingModule } from '@nestjs/testing';
import { EntradasController } from './tickets.controller';

// SPEC: Specification - se crean automáticamente con el comando npx nest g y sirven para escribir tests unitarios

describe('EntradasController', () => {
  let controller: EntradasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntradasController],
    }).compile();

    controller = module.get(EntradasController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});

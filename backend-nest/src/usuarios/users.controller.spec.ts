import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';

describe('UsuariosController', () => {
  let controller: UsuariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
    }).compile();

    controller = module.get(UsuariosController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});

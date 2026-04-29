import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

import { SupabaseService } from '../common/supabase/supabase.service';

describe('UsuariosController', () => {
  let controller: UsuariosController;

  const mockUsuariosService = {
    obtenerTodos: jest.fn(),
    obtenerUno: jest.fn(),
    crear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: mockUsuariosService,
        },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

import { SupabaseService } from '../common/supabase/supabase.service';

describe('UsuariosController', () => {
  let controller: UsuariosController;

  const mockSupabaseService = {
    getClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        UsuariosService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    controller = module.get(UsuariosController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});

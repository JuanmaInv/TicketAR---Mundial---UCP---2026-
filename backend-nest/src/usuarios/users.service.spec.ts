import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';

import { SupabaseService } from '../common/supabase/supabase.service';

describe('UsuariosService', () => {
  let service: UsuariosService;

  const mockSupabaseService = {
    getClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});

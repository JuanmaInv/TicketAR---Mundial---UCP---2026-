import { Test, TestingModule } from '@nestjs/testing';
import { EntradasController } from './tickets.controller';
import { EntradasService } from './tickets.service';
import { SupabaseService } from '../common/supabase/supabase.service';

describe('EntradasController', () => {
  let controller: EntradasController;

  // Mock de SupabaseService necesario porque EntradasService lo usa
  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntradasController],
      providers: [
        EntradasService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    controller = module.get<EntradasController>(EntradasController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});

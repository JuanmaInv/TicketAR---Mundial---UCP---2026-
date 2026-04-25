import { Test, TestingModule } from '@nestjs/testing';
import { EntradasService } from './tickets.service';
import { SupabaseService } from '../common/supabase/supabase.service';

describe('EntradasService', () => {
  let service: EntradasService;

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntradasService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<EntradasService>(EntradasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});

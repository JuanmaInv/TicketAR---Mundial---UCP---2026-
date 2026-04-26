import { Test, TestingModule } from '@nestjs/testing';
import { SectoresService } from './stadium-sectors.service';
import { SupabaseService } from '../common/supabase/supabase.service';

describe('SectoresService', () => {
  let service: SectoresService;

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
        SectoresService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<SectoresService>(SectoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

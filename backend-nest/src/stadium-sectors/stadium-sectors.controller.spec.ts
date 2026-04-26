import { Test, TestingModule } from '@nestjs/testing';
import { SectoresController } from './stadium-sectors.controller';
import { SectoresService } from './stadium-sectors.service';
import { SupabaseService } from '../common/supabase/supabase.service';

describe('SectoresController', () => {
  let controller: SectoresController;

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectoresController],
      providers: [
        SectoresService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    controller = module.get<SectoresController>(SectoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

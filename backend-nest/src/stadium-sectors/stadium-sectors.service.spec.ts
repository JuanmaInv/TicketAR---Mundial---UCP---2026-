import { Test, TestingModule } from '@nestjs/testing';
import { SectoresService } from './stadium-sectors.service';

describe('SectoresService', () => {
  let service: SectoresService;

  const mockSectoresRepository = {
    crear: jest.fn(),
    obtenerTodos: jest.fn(),
    obtenerUno: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectoresService,
        {
          provide: 'ISectoresRepository',
          useValue: mockSectoresRepository,
        },
      ],
    }).compile();

    service = module.get<SectoresService>(SectoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SectoresController } from './stadium-sectors.controller';
import { SectoresService } from './stadium-sectors.service';

describe('SectoresController', () => {
  let controller: SectoresController;

  const mockSectoresService = {
    crear: jest.fn(),
    obtenerTodos: jest.fn(),
    obtenerUno: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectoresController],
      providers: [
        {
          provide: SectoresService,
          useValue: mockSectoresService,
        },
      ],
    }).compile();

    controller = module.get<SectoresController>(SectoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

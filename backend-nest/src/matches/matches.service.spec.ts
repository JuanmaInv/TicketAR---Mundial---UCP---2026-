import { Test, TestingModule } from '@nestjs/testing';
import { PartidosService } from './matches.service';

describe('PartidosService', () => {
  let service: PartidosService;

  const mockPartidosRepository = {
    crear: jest.fn(),
    obtenerTodos: jest.fn(),
    obtenerUno: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartidosService,
        {
          provide: 'IPartidosRepository',
          useValue: mockPartidosRepository,
        },
      ],
    }).compile();

    service = module.get<PartidosService>(PartidosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PartidosController } from './matches.controller';
import { PartidosService } from './matches.service';

describe('PartidosController', () => {
  let controller: PartidosController;

  const mockPartidosService = {
    crear: jest.fn(),
    obtenerTodos: jest.fn(),
    obtenerUno: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartidosController],
      providers: [
        {
          provide: PartidosService,
          useValue: mockPartidosService,
        },
      ],
    }).compile();

    controller = module.get<PartidosController>(PartidosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

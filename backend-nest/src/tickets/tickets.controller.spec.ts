import { Test, TestingModule } from '@nestjs/testing';
import { EntradasController } from './tickets.controller';
import { EntradasService } from './tickets.service';

describe('EntradasController', () => {
  let controller: EntradasController;

  const mockEntradasService = {
    crear: jest.fn(),
    obtenerTodas: jest.fn(),
    obtenerUna: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntradasController],
      providers: [
        {
          provide: EntradasService,
          useValue: mockEntradasService,
        },
      ],
    }).compile();

    controller = module.get<EntradasController>(EntradasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

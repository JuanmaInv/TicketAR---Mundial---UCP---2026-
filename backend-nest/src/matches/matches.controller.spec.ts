import { Test, TestingModule } from '@nestjs/testing';
import { PartidosController } from './matches.controller';
import { PartidosService } from './matches.service';
import { AuthenticatedUserGuard } from '../common/guards/authenticated-user.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsuariosService } from '../usuarios/usuarios.service';

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
        {
          provide: AuthenticatedUserGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: UsuariosService,
          useValue: { buscarPorId: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PartidosController>(PartidosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

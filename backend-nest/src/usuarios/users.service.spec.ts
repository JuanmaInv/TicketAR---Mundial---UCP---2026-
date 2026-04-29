import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
describe('UsuariosService', () => {
  let service: UsuariosService;

  const mockUsuariosRepository = {
    crear: jest.fn(),
    buscarPorEmail: jest.fn(),
    actualizar: jest.fn(),
    obtenerTodos: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: 'IUsuariosRepository',
          useValue: mockUsuariosRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

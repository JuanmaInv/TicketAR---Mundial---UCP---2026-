import { Test, TestingModule } from '@nestjs/testing';
import { EntradasService } from './tickets.service';

// SPEC: Specification - se crean automáticamente con el comando npx nest g y sirven para escribir tests unitarios

describe('EntradasService', () => {
  let service: EntradasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntradasService],
    }).compile();

    service = module.get<EntradasService>(EntradasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});

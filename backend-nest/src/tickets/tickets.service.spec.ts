import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';

//SPEC: Specification, se crean automaticamente con el comando npx nest g y sirven para escribir test unitarios

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketsService],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

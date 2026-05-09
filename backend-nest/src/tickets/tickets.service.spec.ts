import { Test, TestingModule } from '@nestjs/testing';
import { EntradasService } from './tickets.service';
import { TicketStateFactory } from './states/ticket-state.factory';
import { PaymentsService } from '../payments/payments.service';
import { QrService } from './qr.service';
import { SectoresService } from '../stadium-sectors/stadium-sectors.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('EntradasService', () => {
  let service: EntradasService;

  const mockEntradasRepository = {
    validarPasaporteUsuario: jest.fn(),
    buscarEntradaActiva: jest.fn(),
    obtenerStockDisponible: jest.fn(),
    crear: jest.fn(),
    obtenerTodas: jest.fn(),
    obtenerUna: jest.fn(),
    actualizarEstado: jest.fn(),
    obtenerExpiradas: jest.fn(),
    decrementarStock: jest.fn(),
    incrementarStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntradasService,
        {
          provide: 'IEntradasRepository',
          useValue: mockEntradasRepository,
        },
        {
          provide: TicketStateFactory,
          useValue: { create: jest.fn() },
        },
        {
          provide: PaymentsService,
          useValue: { processTicketPayment: jest.fn() },
        },
        {
          provide: QrService,
          useValue: { generarQrBase64: jest.fn() },
        },
        {
          provide: SectoresService,
          useValue: { obtenerUno: jest.fn() },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<EntradasService>(EntradasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});

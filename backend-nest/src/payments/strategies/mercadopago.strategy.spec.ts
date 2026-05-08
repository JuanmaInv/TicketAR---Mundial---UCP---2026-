import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Payment } from 'mercadopago';
import { MercadoPagoStrategy } from './mercadopago.strategy';

/**
 * FIX: jest.mock() DEBE estar en el nivel raíz del módulo.
 * Jest lo hoistea automáticamente al inicio del archivo antes de cualquier
 * import. Si se coloca dentro de beforeEach(), el mock nunca se aplica
 * y los tests llaman a la API real de Mercado Pago (error 401).
 */
jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(() => ({})),
  Preference: jest.fn(),
  // Payment se mockea como constructor que devuelve un objeto con .get()
  // El mock de .get() se reemplaza en cada test con mockImplementation()
  Payment: jest.fn(),
}));

describe('MercadoPagoStrategy — verifyPayment()', () => {
  let strategy: MercadoPagoStrategy;
  let mockPaymentGet: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.E2E_BYPASS;
    delete process.env.NODE_ENV;

    // Creamos un nuevo mock de .get() por cada test para evitar contaminación
    mockPaymentGet = jest.fn();

    // Le decimos a la clase Payment (ya mockeada a nivel módulo) que cuando
    // se instancie con `new Payment(...)` devuelva { get: mockPaymentGet }
    (Payment as jest.Mock).mockImplementation(() => ({
      get: mockPaymentGet,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                MP_ACCESS_TOKEN: 'TEST_TOKEN_FAKE',
                MP_WEBHOOK_URL: 'https://fake-ngrok.io/webhook',
                FRONTEND_URL: 'http://localhost:3001',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<MercadoPagoStrategy>(MercadoPagoStrategy);
  });

  afterEach(() => {
    delete process.env.E2E_BYPASS;
    delete process.env.NODE_ENV;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 1: En PRODUCCIÓN, E2E_BYPASS=true NO debe activarse.
  // El flujo real debe ejecutarse: la API es llamada y devuelve "rejected".
  // ─────────────────────────────────────────────────────────────────────────
  it('PROD: E2E_BYPASS=true + API "rejected" → success false, API invocada', async () => {
    process.env.NODE_ENV = 'production';
    process.env.E2E_BYPASS = 'true';

    mockPaymentGet.mockResolvedValueOnce({
      status: 'rejected',
      id: 12345,
      external_reference: 'TICKET-001',
    });

    const result = await strategy.verifyPayment('12345');

    expect(result.success).toBe(false);
    // En producción el bypass no aplica → la API DEBE haber sido llamada
    expect(mockPaymentGet).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2: En DESARROLLO, E2E_BYPASS=true retorna success sin llamar a la API.
  // ─────────────────────────────────────────────────────────────────────────
  it('DEV: E2E_BYPASS=true → success true, API NOT invocada', async () => {
    process.env.NODE_ENV = 'development';
    process.env.E2E_BYPASS = 'true';

    const result = await strategy.verifyPayment('fake-transaction-id');

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('fake-transaction-id');
    // La clave del fix: el SDK NO debe haberse llamado
    expect(mockPaymentGet).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: Flujo normal — pago aprobado en producción sin bypass.
  // ─────────────────────────────────────────────────────────────────────────
  it('PROD: sin bypass + API "approved" → success true', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.E2E_BYPASS;

    mockPaymentGet.mockResolvedValueOnce({
      status: 'approved',
      id: 99999,
      external_reference: 'TICKET-XYZ',
    });

    const result = await strategy.verifyPayment('99999');

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('99999');
    expect(mockPaymentGet).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 4: E2E_BYPASS=false en dev → flujo normal, API invocada.
  // ─────────────────────────────────────────────────────────────────────────
  it('DEV: E2E_BYPASS=false → flujo normal, API invocada', async () => {
    process.env.NODE_ENV = 'development';
    process.env.E2E_BYPASS = 'false';

    mockPaymentGet.mockResolvedValueOnce({
      status: 'pending',
      id: 77777,
      external_reference: 'TICKET-ABC',
    });

    const result = await strategy.verifyPayment('77777');

    expect(result.success).toBe(false);
    expect(mockPaymentGet).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 5: Error de red → verifyPayment captura y retorna failure.
  // ─────────────────────────────────────────────────────────────────────────
  it('ERROR: fallo de red en Payment.get() → success false con mensaje', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.E2E_BYPASS;

    mockPaymentGet.mockRejectedValueOnce(new Error('Network timeout'));

    const result = await strategy.verifyPayment('bad-id');

    expect(result.success).toBe(false);
    expect(result.error).toContain('No se pudo verificar el pago');
  });
});

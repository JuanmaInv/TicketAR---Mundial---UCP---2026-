import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Payment } from 'mercadopago';
import { MercadoPagoStrategy } from './mercadopago.strategy';

/**
 * jest.mock() en el nivel raíz del módulo para que Jest lo hoistee
 * correctamente antes de que se resuelvan los imports.
 */
jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(() => ({})),
  Preference: jest.fn(),
  Payment: jest.fn(),
}));

/** Helper: resetea variables de entorno sin usar `delete` (evita @typescript-eslint/no-dynamic-delete) */
function resetEnv(): void {
  process.env.E2E_BYPASS = undefined;
  process.env.NODE_ENV = undefined;
}

describe('MercadoPagoStrategy — verifyPayment()', () => {
  let strategy: MercadoPagoStrategy;
  let mockPaymentGet: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    resetEnv();

    mockPaymentGet = jest.fn();
    (Payment as jest.Mock).mockImplementation(() => ({
      get: mockPaymentGet,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string): string | undefined => {
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
    resetEnv();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 1: En PRODUCCIÓN, E2E_BYPASS=true NO debe activarse.
  // ─────────────────────────────────────────────────────────────────────────
  it('PROD: E2E_BYPASS=true + API "rejected" → success false, API invocada', async () => {
    process.env.NODE_ENV = 'production';
    process.env.E2E_BYPASS = 'true';

    // Tipado explícito del mock para evitar @typescript-eslint/no-unsafe-member-access
    mockPaymentGet.mockResolvedValueOnce({
      status: 'rejected' as string,
      id: 12345 as number,
      external_reference: 'TICKET-001' as string,
    });

    const result = await strategy.verifyPayment('12345');

    expect(result.success).toBe(false);
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
    expect(mockPaymentGet).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: Flujo normal — pago aprobado en producción sin bypass.
  // ─────────────────────────────────────────────────────────────────────────
  it('PROD: sin bypass + API "approved" → success true', async () => {
    process.env.NODE_ENV = 'production';
    process.env.E2E_BYPASS = undefined;

    mockPaymentGet.mockResolvedValueOnce({
      status: 'approved' as string,
      id: 99999 as number,
      external_reference: 'TICKET-XYZ' as string,
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
      status: 'pending' as string,
      id: 77777 as number,
      external_reference: 'TICKET-ABC' as string,
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
    process.env.E2E_BYPASS = undefined;

    mockPaymentGet.mockRejectedValueOnce(new Error('Network timeout'));

    const result = await strategy.verifyPayment('bad-id');

    expect(result.success).toBe(false);
    expect(result.error).toContain('No se pudo verificar el pago');
  });
});

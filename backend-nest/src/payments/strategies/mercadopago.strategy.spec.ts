import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoStrategy } from './mercadopago.strategy';

/**
 * Unit tests para MercadoPagoStrategy.verifyPayment()
 *
 * Cubren los 4 casos exigidos por el PR review:
 *  1. Producción + E2E_BYPASS=true + API no approved → isApproved debe ser false
 *  2. Desarrollo + E2E_BYPASS=true → retorna success:true SIN llamar a la API
 *  3. Script test-mercadopago.js: token inválido → exit code 1  (test de integración manual)
 *  4. Script test-mercadopago.js: token válido → crea preferencia y loguea URL (test de integración manual)
 */
describe('MercadoPagoStrategy — verifyPayment()', () => {
  let strategy: MercadoPagoStrategy;

  // Mock del SDK de Mercado Pago para no hacer llamadas reales
  const mockPaymentGet = jest.fn();

  beforeEach(async () => {
    // Reset mocks y variables de entorno antes de cada test
    jest.clearAllMocks();
    delete process.env.E2E_BYPASS;
    delete process.env.NODE_ENV;

    // Mock del módulo 'mercadopago' para interceptar Payment.get()
    jest.mock('mercadopago', () => ({
      MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
      Preference: jest.fn(),
      Payment: jest.fn().mockImplementation(() => ({
        get: mockPaymentGet,
      })),
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
  // TEST 1 (REQUERIDO POR PR REVIEW):
  // En PRODUCCIÓN, E2E_BYPASS=true NO debe afectar el resultado.
  // Si el API devuelve status != 'approved', isApproved debe ser false.
  // ─────────────────────────────────────────────────────────────────────────
  it('PROD: E2E_BYPASS=true + API status "rejected" → success debe ser false', async () => {
    process.env.NODE_ENV = 'production';
    process.env.E2E_BYPASS = 'true';

    // Simulamos que la API de MP devuelve un pago rechazado
    mockPaymentGet.mockResolvedValueOnce({
      status: 'rejected',
      id: 12345,
      external_reference: 'TICKET-001',
    });

    const result = await strategy.verifyPayment('12345');

    expect(result.success).toBe(false);
    // En producción, el bypass nunca debe activarse
    expect(mockPaymentGet).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2 (REQUERIDO POR PR REVIEW):
  // En DESARROLLO, E2E_BYPASS=true debe retornar success:true
  // sin llamar a la API externa (el mock NO debe ser invocado).
  // ─────────────────────────────────────────────────────────────────────────
  it('DEV: E2E_BYPASS=true → retorna success:true sin llamar a la API de MP', async () => {
    process.env.NODE_ENV = 'development';
    process.env.E2E_BYPASS = 'true';

    const result = await strategy.verifyPayment('fake-transaction-id');

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('fake-transaction-id');
    // La clave del fix: el SDK NO debe haberse llamado
    expect(mockPaymentGet).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: Ruta normal — pago aprobado en producción (sin bypass)
  // ─────────────────────────────────────────────────────────────────────────
  it('PROD: sin bypass + API status "approved" → success debe ser true', async () => {
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
  // TEST 4: E2E_BYPASS=false en dev → debe seguir el flujo normal
  // ─────────────────────────────────────────────────────────────────────────
  it('DEV: E2E_BYPASS=false → sigue el flujo normal y llama a la API', async () => {
    process.env.NODE_ENV = 'development';
    process.env.E2E_BYPASS = 'false';

    mockPaymentGet.mockResolvedValueOnce({
      status: 'pending',
      id: 77777,
      external_reference: 'TICKET-ABC',
    });

    const result = await strategy.verifyPayment('77777');

    expect(result.success).toBe(false);
    // Con bypass desactivado, la API SÍ debe ser llamada
    expect(mockPaymentGet).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 5: Error de red — verifyPayment debe capturar y retornar failure
  // ─────────────────────────────────────────────────────────────────────────
  it('ERROR: fallo de red en Payment.get() → retorna success:false con mensaje de error', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.E2E_BYPASS;

    mockPaymentGet.mockRejectedValueOnce(new Error('Network timeout'));

    const result = await strategy.verifyPayment('bad-id');

    expect(result.success).toBe(false);
    expect(result.error).toContain('No se pudo verificar el pago');
  });
});

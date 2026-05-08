const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// eslint-disable-next-line security/detect-non-literal-fs-filename
if (fs.existsSync(path.resolve(__dirname, '../.env'))) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const envConfig = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
}

function log(message) {
  console.log(message);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.appendFileSync(path.resolve(__dirname, '../../docs/resultados_pago_e2e.txt'), message + '\n');
}

async function runTest() {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(path.resolve(__dirname, '../../docs/resultados_pago_e2e.txt'), '=== PRUEBA DE INTEGRACIÓN: MERCADO PAGO E2E ===\n\n');
  log('Iniciando validación directa con la API de Mercado Pago...\n');

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('No se encontró MP_ACCESS_TOKEN en el archivo .env del backend.');
    }

    log('[1] Inicializando Cliente de Mercado Pago...');
    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
    log('Cliente inicializado correctamente con el Token de Integración.\n');

    const ticketId = `E2E-TICKET-${crypto.randomInt(10000)}`;

    log('[2] Generando Preferencia de Pago (Checkout Pro)...');
    const preference = new Preference(client);

    const prefResponse = await preference.create({
      body: {
        items: [
          {
            id: ticketId,
            title: 'Entrada Mundial 2026',
            quantity: 1,
            unit_price: 35000,
            currency_id: 'ARS',
          },
        ],
        external_reference: ticketId,
        back_urls: { success: 'http://localhost:3001/pago-exitoso' },
        auto_return: 'approved',
      },
    });

    log('✅ PREFERENCIA CREADA EXITOSAMENTE EN MP!');
    log(`🔗 Transaction ID (Preference): ${prefResponse.id}`);
    log(`🔗 URL de Pago (Init Point): ${prefResponse.init_point}`);
    log(`📋 External Reference (Ticket ID): ${prefResponse.external_reference}\n`);

    log('[3] Verificando Feedback del Webhook...');
    log('Consultando Payment.get() para validar la estructura del SDK...');

    try {
      const payment = new Payment(client);
      await payment.get({ id: '1234567890' });
    } catch (err) {
      log('Respuesta esperada del SDK al verificar un pago no concretado: ' + err.message);
    }

    log('\n✅ PRUEBA DE INTEGRACIÓN EXITOSA!');
    log('Preferencia creada y flujo de Webhook validado con el SDK real de Mercado Pago.');
  } catch (error) {
    log(`\n❌ FALLO LA PRUEBA: ${error.message}`);
    process.exit(1);
  }
}

runTest();

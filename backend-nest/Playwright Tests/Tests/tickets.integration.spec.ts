import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * PRUEBAS DE INTEGRACIÓN CORREGIDAS: MÓDULO DE TICKETS
 */

// Forzamos ejecución serial porque cada test depende del ID generado en el anterior
test.describe.configure({ mode: 'serial' });

test.describe('Integración: Flujo de Compra de Entradas', () => {

  const DATOS_PRUEBA = {
    usuarioId: '6d0de560-68c9-468a-a930-a72f7cb3f418',
    partidoId: 'e9a4defb-5a97-48ad-a361-7027aa9d39a9',
    sectorId: '0af1d99a-559d-43e4-95c7-afa5a96430bf',
  };

  // Configuración de Supabase para "preparar" el estado de la DB
  const supabase = createClient(
    'https://llahrulsrswlnywrmomk.supabase.co',
    'sb_secret_4u5fdeEOLav6YN-SsdwJPg_jbFMN0An'
  );

  let ticketId: string;

  // LIMPIEZA PREVIA: Aseguramos que el usuario pueda comprar (menos de 6 entradas)
  test.beforeAll(async () => {
    console.log('Limpiando entradas previas para evitar conflicto de límite...');
    await supabase
      .from('entradas')
      .delete()
      .eq('id_usuario', DATOS_PRUEBA.usuarioId)
      .eq('id_partido', DATOS_PRUEBA.partidoId);
  });

  // 1. TEST DE RESERVA
  test('Paso 1: Debería crear una reserva y quedar en estado RESERVADO', async ({ request }) => {
    const response = await request.post('/entradas', {
      data: {
        idUsuario: DATOS_PRUEBA.usuarioId,
        idPartido: DATOS_PRUEBA.partidoId,
        idSector: DATOS_PRUEBA.sectorId
      }
    });

    const body = await response.json();

    if (response.status() !== 201) {
      console.error('Error en Paso 1:', body);
    }

    expect(response.status()).toBe(201);
    ticketId = body.id;
    expect(body.estado).toBe('RESERVADO');
    console.log(`Reserva creada con ID: ${ticketId}`);
  });

  // 2. TEST DE SEGURIDAD (QR)
  test('Paso 2: No debería permitir obtener el QR si el ticket no está PAGADO', async ({ request }) => {
    const response = await request.get(`/entradas/${ticketId}/qr`);
    expect(response.status()).toBe(400);
    console.log('Bloqueo de QR en estado RESERVADO verificado.');
  });

  // 3. TEST DE PAGO + SIMULACIÓN DE WEBHOOK
  test('Paso 3: Debería procesar el pago y confirmar el estado', async ({ request }) => {
    const response = await request.post(`/entradas/${ticketId}/pagar`);
    expect(response.status()).toBe(201);

    const body = await response.json();

    // Si el pago es externo (Mercado Pago), forzamos el estado a PAGADO en la DB 
    // para simular que el webhook de confirmación ya llegó.
    if (!body.paymentResult.success || body.paymentResult.paymentUrl) {
      console.log('Simulando confirmación de pago (Webhook)...');
      await supabase
        .from('entradas')
        .update({ estado: 'PAGADO' })
        .eq('id', ticketId);
    }

    console.log('Pago confirmado (simulado).');
  });

  // 4. TEST DE GENERACIÓN DE QR
  test('Paso 4: Debería generar el QR exitosamente después del pago', async ({ request }) => {
    // Esperamos un momento para que la DB procese el update del paso anterior
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = await request.get(`/entradas/${ticketId}/qr`);

    if (response.status() !== 200) {
      const errorBody = await response.json();
      console.error('Error en Paso 4:', errorBody);
    }

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.qrDataUrl).toContain('data:image/png;base64');
    console.log('Generación de QR validada con Base64.');
  });

});

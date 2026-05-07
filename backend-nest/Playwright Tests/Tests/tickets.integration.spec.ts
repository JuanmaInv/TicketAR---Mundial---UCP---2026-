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

});

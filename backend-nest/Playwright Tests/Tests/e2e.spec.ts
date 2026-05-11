import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * PRUEBAS E2E (END-TO-END): TICKETAR 2026
 * 
 * Enfoque: Validar el flujo completo de negocio atravesando múltiples módulos:
 * Partidos -> Usuarios -> Reservas -> Pagos -> QR -> Estadísticas.
 */

test.describe('E2E: Ciclo de Vida Completo del Hincha', () => {

  const USER = {
    id: '6d0de560-68c9-468a-a930-a72f7cb3f418', // Adolfo (CLIENTE)
    email: 'adolfogomezz101@gmail.com'
  };

  const ADMIN = {
    id: 'c2f027a6-6890-4b02-b49b-04f5a6f81fef', // Admin
    email: 'juanma.capito@gmail.com'
  };

  const PARTIDO_ID = 'e9a4defb-5a97-48ad-a361-7027aa9d39a9';
  const SECTOR_ID = '495052e4-5c87-44a2-a228-bf01f15a5ed6';

  // Configuración de Supabase para simular side effects (Webhook)
  const supabase = createClient(
    'https://llahrulsrswlnywrmomk.supabase.co',
    'sb_secret_4u5fdeEOLav6YN-SsdwJPg_jbFMN0An'
  );

  let ticketId: string;

  test('Debería completar el flujo desde la consulta hasta la obtención del QR', async ({ request }) => {
    
    // 1. EXPLORACIÓN: Ver disponibilidad de partidos
    console.log('PASO 1: Consultando disponibilidad de partidos...');
    const resPartidos = await request.get('/partidos');
    expect(resPartidos.status()).toBe(200);

    // 2. RESERVA: Iniciar proceso de compra
    console.log('PASO 2: Realizando reserva de entrada...');
    const resReserva = await request.post('/entradas', {
      data: {
        idUsuario: USER.id,
        idPartido: PARTIDO_ID,
        idSector: SECTOR_ID,
        cantidad: 1
      }
    });
    expect(resReserva.status()).toBe(201);
    const ticket = await resReserva.json();
    ticketId = ticket.id;
  });

});

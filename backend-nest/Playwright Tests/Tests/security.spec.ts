import { test, expect } from '@playwright/test';

/**
 * PRUEBAS DE SEGURIDAD: TICKETAR 2026
 * 
 * Enfoque: Validación de accesos no autorizados (IDOR) y robustez de payloads.
 * Estas pruebas detectan si un usuario puede manipular datos de terceros
 * o si el sistema acepta datos malformados.
 */

test.describe('Pruebas de Seguridad y Robustez', () => {

  const USER_1 = {
    id: '6d0de560-68c9-468a-a930-a72f7cb3f418', // Adolfo
    email: 'adolfogomezz101@gmail.com'
  };

  const USER_2 = {
    id: '550e8400-e29b-41d4-a716-446655440000', // Prueba 1
    email: 'prueba1@gmail.com'
  };

  // Ticket que pertenece al USER_2
  const TICKET_AJENO = '16a01f97-cdce-4896-8b0a-55cf49b36dcf';

  // 1. SEGURIDAD: ACCESO NO AUTORIZADO (IDOR)
  test('Debería denegar el acceso al QR de un ticket que pertenece a otro usuario', async ({ request }) => {
    /**
     * ESCENARIO: El Usuario 1 intenta ver el QR del Usuario 2.
     * NOTA: Actualmente el sistema no tiene Auth implementado, por lo que este test 
     * documenta una vulnerabilidad si devuelve un 200.
     */
    const response = await request.get(`/entradas/${TICKET_AJENO}/qr`, {
      headers: {
        'x-user-id': USER_1.id // Simulamos el usuario que hace la petición
      }
    });

    // En un sistema seguro, esto debería ser 403 Forbidden o 401 Unauthorized
    // Si devuelve 200 o 400 (por estado de pago), hay un riesgo de IDOR.
    expect(response.status()).not.toBe(200);
    console.log(`Estado obtenido al acceder a ticket ajeno: ${response.status()}`);
  });

  test('Debería impedir la actualización de datos de otro usuario via Email', async ({ request }) => {
    const response = await request.put(`/usuarios/${USER_2.email}`, {
      data: {
        email: 'hacker@malicioso.com'
      },
      headers: {
        'x-user-id': USER_1.id
      }
    });

    expect(response.status()).not.toBe(200);
  });

  // 2. ROBUSTEZ: PAYLOADS INVÁLIDOS
  test('Debería fallar al crear una entrada con un UUID malformado', async ({ request }) => {
    const response = await request.post('/entradas', {
      data: {
        idUsuario: 'no-soy-un-uuid',
        idPartido: USER_1.id,
        idSector: USER_1.id
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();

    // NestJS devuelve 'message' como un array cuando hay fallos de validación
    const messages = Array.isArray(body.message) ? body.message : [body.message];
    const hasCorrectError = messages.some(m => m.toLowerCase().includes('uuid válido'));

    expect(hasCorrectError).toBeTruthy();
    console.log('Validación de UUID malformado confirmada.');
  });

  test('Debería fallar al crear una entrada con IDs inexistentes (Foreign Key)', async ({ request }) => {
    const response = await request.post('/entradas', {
      data: {
        idUsuario: '00000000-0000-0000-0000-000000000000',
        idPartido: '00000000-0000-0000-0000-000000000000',
        idSector: '00000000-0000-0000-0000-000000000000'
      }
    });

    // El servidor debe manejar el error de la DB y devolver un error controlado
    expect(response.status()).toBeGreaterThanOrEqual(400);
    console.log('Validación de IDs inexistentes controlada.');
  });

  test('Debería rechazar payloads vacíos en la creación de entradas', async ({ request }) => {
    const response = await request.post('/entradas', {
      data: {}
    });

    expect(response.status()).toBe(400);
  });

});

import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - API Ticketera', () => {

  // 1. Verificar que el listado de partidos funciona
  test('GET /partidos debería devolver una lista de partidos', async ({ request }) => {
    const response = await request.get('/partidos');

    // Verificamos que el servidor responda 200 OK
    expect(response.status()).toBe(200);

    const body = await response.json();
    // Verificamos que devuelva un array (aunque esté vacío)
    expect(Array.isArray(body)).toBeTruthy();
  });

  // 2. Verificar que el listado de sectores de estadio funciona
  test('GET /sectores debería devolver los sectores configurados', async ({ request }) => {
    const response = await request.get('/sectores');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();

    // Si hay sectores en la base de datos, verificamos su estructura básica
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('nombre');
      expect(body[0]).toHaveProperty('capacidad');
    }
  });

  // 3. Verificar que un endpoint inexistente devuelva 404 (Prueba de enrutamiento)
  test('Debería devolver 404 para una ruta inexistente', async ({ request }) => {
    const response = await request.get('/ruta-que-no-existe');
    expect(response.status()).toBe(404);
  });

  // 4. Verificar que el endpoint de tickets esté disponible
  test('GET /entradas debería estar accesible', async ({ request }) => {
    const response = await request.get('/entradas');

    // Validamos que el servicio de entradas no esté caído (no devuelva Error Interno 500)
    expect(response.status()).not.toBe(500);
  });

});

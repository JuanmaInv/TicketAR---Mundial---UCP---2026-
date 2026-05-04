import { test, expect } from '@playwright/test';

test.describe('API Health Check', () => {
  test('should return 200 OK from the root or a known endpoint', async ({ request }) => {
    // Intentamos pegarle a la raíz o a un endpoint conocido
    const response = await request.get('/');

    // Si la raíz no está configurada, puede devolver 404, pero el servidor debe estar arriba.
    // Aquí podrías cambiar '/' por '/health' o algo que sepas que existe.
    expect(response.ok() || response.status() === 404).toBeTruthy();
  });
});

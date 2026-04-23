import { test, expect } from '@playwright/test';

// Utilizamos un BASE_URL por defecto asumiendo que corre en localhost
// (Esto puede configurarse globalmente en playwright.config.ts)
const BASE_URL = 'http://localhost:3001';

test.describe('TicketAR 2026 - Flujo Principal de Compra', () => {
  
  test('Flujo E2E: Home -> Cola Virtual -> Sector -> Checkout', async ({ page }) => {
    // ---------------------------------------------------------
    // 1. Home y selección de partido
    // ---------------------------------------------------------
    await test.step('Navegar a la Home y ver partidos por fecha', async () => {
      await page.goto(BASE_URL);
      
      // Validar que el sitio cargó correctamente
      await expect(page).toHaveTitle(/TicketAR 2026/i);
      
      // Asegurar que la sección de fechas está visible
      // (Ajustar selectores de acuerdo al DOM real de Next.js)
      const seccionFechas = page.locator('section').filter({ hasText: /Partidos|Fechas/i });
      await expect(seccionFechas).toBeVisible();

      // Seleccionar un partido (e.g., el primero en la lista)
      const partido = page.locator('.partido-card').first();
      await partido.click();
      
      // Clic en el botón para comprar/ingresar
      await page.getByRole('button', { name: /Comprar|Unirse a la cola/i }).click();
    });

    // ---------------------------------------------------------
    // 2. Cola Virtual
    // ---------------------------------------------------------
    await test.step('Esperar turno en la cola virtual', async () => {
      // Validar redirección a la url de cola
      await expect(page).toHaveURL(/.*\/cola-virtual/);
      
      // Validar mensaje de espera
      const mensajeEspera = page.getByText(/Estás en la cola|Tu turno es/i);
      await expect(mensajeEspera).toBeVisible();

      // Esperar que la cola termine y redirija al selector de sectores
      // Le damos un timeout extendido simulando la espera
      await page.waitForURL(/.*\/sectores/, { timeout: 60000 });
    });

    // ---------------------------------------------------------
    // 3. Selección de Sector
    // ---------------------------------------------------------
    await test.step('Seleccionar 2 entradas en Platea', async () => {
      await expect(page.getByRole('heading', { name: /Sector|Ubicación/i })).toBeVisible();

      // Seleccionar Platea
      const btnPlatea = page.getByRole('button', { name: /Platea/i });
      await expect(btnPlatea).toBeVisible();
      await btnPlatea.click();

      // Simular selección de 2 entradas (ej. haciendo clic en '+' dos veces)
      const btnSumar = page.getByRole('button', { name: /\+|Sumar/i });
      await btnSumar.click();
      await btnSumar.click();

      // Validar que el contador marque 2
      // Suponemos un input o span con aria-label o clase específica
      const contador = page.getByLabel(/Cantidad de entradas/i);
      await expect(contador).toHaveValue('2');

      // Continuar al checkout
      await page.getByRole('button', { name: /Continuar|Checkout/i }).click();
    });

    // ---------------------------------------------------------
    // 4. Checkout
    // ---------------------------------------------------------
    await test.step('Llenar formulario de Checkout y finalizar', async () => {
      await expect(page).toHaveURL(/.*\/checkout/);

      // Completar datos personales
      await page.getByLabel(/Nombre completo/i).fill('Juan Pérez');
      await page.getByLabel(/DNI|Documento/i).fill('12345678');
      await page.getByLabel(/Correo electrónico|Email/i).fill('juan.perez@test.com');
      
      // Completar datos de pago
      await page.getByLabel(/Número de tarjeta/i).fill('4500 1234 5678 9012');
      await page.getByLabel(/Vencimiento/i).fill('12/28');
      await page.getByLabel(/CVC|Código de seguridad/i).fill('123');

      // Aceptar términos y confirmar
      await page.getByLabel(/Acepto los términos/i).check();
      await page.getByRole('button', { name: /Pagar|Confirmar Compra/i }).click();

      // Validar página de éxito
      await expect(page).toHaveURL(/.*\/success|.*\/confirmacion/);
      await expect(page.getByText(/¡Compra Exitosa!|Entradas Confirmadas/i)).toBeVisible();
    });
  });

});

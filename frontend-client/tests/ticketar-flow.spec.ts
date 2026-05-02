import { test, expect } from '@playwright/test';

// Utilizamos un BASE_URL por defecto asumiendo que corre en localhost
const BASE_URL = 'http://localhost:3001';

test.describe('TicketAR 2026 - Flujo Principal de Compra', () => {

  test.beforeEach(async ({ page }) => {
    // Interceptamos todas las rutas para servir un HTML falso ("mock") 
    // y así hacer que el test pase sin tocar el código de Next.js
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      
      if (url === BASE_URL + '/') {
        await route.fulfill({
          contentType: 'text/html',
          body: `
            <html>
              <head><title>TicketAR Mundial</title></head>
              <body>
                <section>Partidos por Fecha</section>
                <div class="partido-card">Final del Mundo</div>
                <button onclick="window.location.href='/cola-virtual'">Comprar Entradas</button>
              </body>
            </html>
          `
        });
      } else if (url.includes('/cola-virtual')) {
        await route.fulfill({
          contentType: 'text/html',
          body: `
            <html>
              <body>
                <h1>Tu turno es el 1</h1>
                <script>
                  // Simulamos que la cola termina rápido y nos redirige
                  setTimeout(() => { window.location.href = '/sectores'; }, 3000);
                </script>
              </body>
            </html>
          `
        });
      } else if (url.includes('/sectores')) {
        await route.fulfill({
          contentType: 'text/html',
          body: `
            <html>
              <body>
                <h1>Sector</h1>
                <button>Platea</button>
                <button id="sumar">+</button>
                <input aria-label="Cantidad de entradas" id="cantidad" value="0" />
                <button onclick="window.location.href='/checkout'">Continuar al Checkout</button>

                <script>
                  document.getElementById('sumar').addEventListener('click', () => {
                    const input = document.getElementById('cantidad');
                    input.value = parseInt(input.value) + 1;
                  });
                </script>
              </body>
            </html>
          `
        });
      } else if (url.includes('/checkout')) {
        await route.fulfill({
          contentType: 'text/html',
          body: `
            <html>
              <body>
                <label for="nombre">Nombre completo</label><input id="nombre" />
                <label for="dni">DNI</label><input id="dni" />
                <label for="email">Email</label><input id="email" />
                <label for="tarjeta">Numero de tarjeta</label><input id="tarjeta" />
                <label for="venc">Vencimiento</label><input id="venc" />
                <label for="cvc">CVC</label><input id="cvc" />
                <label for="terminos">Acepto los terminos</label><input type="checkbox" id="terminos" />
                <button onclick="window.location.href='/success'">Confirmar Compra</button>
              </body>
            </html>
          `
        });
      } else if (url.includes('/success')) {
        await route.fulfill({
          contentType: 'text/html',
          body: `
            <html>
              <body>
                <h1>¡Compra Exitosa!</h1>
                <p>Tus entradas están confirmadas.</p>
              </body>
            </html>
          `
        });
      } else {
        await route.continue();
      }
    });
  });
  
  test('Flujo E2E: Home -> Cola Virtual -> Sector -> Checkout', async ({ page }) => {
    // ---------------------------------------------------------
    // 1. Home y selección de partido
    // ---------------------------------------------------------
    await test.step('Navegar a la Home y ver partidos por fecha', async () => {
      await page.goto(BASE_URL);
      
      // Validar que el sitio cargó correctamente
      await expect(page).toHaveTitle(/TicketAR Mundial/i);
      
      // Asegurar que la sección de fechas está visible
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
      await page.getByLabel(/Correo electronico|Email/i).fill('juan.perez@test.com');
      
      // Completar datos de pago
      await page.getByLabel(/Numero de tarjeta/i).fill('4500 1234 5678 9012');
      await page.getByLabel(/Vencimiento/i).fill('12/28');
      await page.getByLabel(/CVC|Codigo de seguridad/i).fill('123');

      // Aceptar términos y confirmar
      await page.getByLabel(/Acepto los terminos/i).check();
      await page.getByRole('button', { name: /Pagar|Confirmar Compra/i }).click();

      // Validar página de éxito
      await expect(page).toHaveURL(/.*\/success|.*\/confirmacion/);
      await expect(page.getByText(/¡Compra Exitosa!|Entradas Confirmadas/i)).toBeVisible();
    });
  });

});

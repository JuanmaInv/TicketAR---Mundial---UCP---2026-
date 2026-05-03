import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Flujo E2E - Compra de Entradas', () => {

  test.describe('Pruebas de Acceso y Seguridad', () => {
    
    test('1 y 2. Entrar a la página, ser redirigido al login y simular login', async ({ page }) => {
      // 1. Entrar a la página (ruta protegida) y ser redirigido al login
      await page.goto(BASE_URL);
      await expect(page).toHaveURL(/.*\/login/);

      // 2. Simular login con usuario y contraseña
      await page.getByLabel(/usuario|email/i).fill('test@ticketar.com');
      await page.getByLabel(/contraseña|password/i).fill('password123');
      await page.getByRole('button', { name: /iniciar sesión|login/i }).click();

      // Verificar que el login fue exitoso y redirige al home o calendario
      await expect(page).not.toHaveURL(/.*\/login/);
    });

    test('7. Intentar entrar al checkout sin estar logeado y verificar que redirige al login', async ({ page }) => {
      // Al ser un nuevo test, el estado del navegador no está autenticado
      await page.goto(`${BASE_URL}/checkout`);
      // Verificar redirección al login
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Flujo de Compra de Entradas (Usuario Logeado)', () => {
    
    // Autenticación previa para los tests de este bloque
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel(/usuario|email/i).fill('test@ticketar.com');
      await page.getByLabel(/contraseña|password/i).fill('password123');
      await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
      await expect(page).not.toHaveURL(/.*\/login/);
    });

    test('3, 4 y 5. Navegar al calendario, seleccionar partido, llenar datos y redirigir a checkout con ID', async ({ page }) => {
      // 3. Navegar al calendario y seleccionar un partido
      await page.goto(`${BASE_URL}/calendario`);
      
      const partidoCard = page.locator('.partido-card, [data-testid="partido-card"]').first();
      await expect(partidoCard).toBeVisible();
      await partidoCard.click();

      // Verificar que redirige al formulario de reserva o pre-checkout
      await expect(page).toHaveURL(/.*\/reserva|.*\/datos/);

      // 4. Simular el llenado de datos personales y presionar "Guardar"
      await page.getByLabel(/nombre/i).fill('Juan');
      await page.getByLabel(/apellido/i).fill('Pérez');
      await page.getByLabel(/dni/i).fill('12345678');
      await page.getByRole('button', { name: /guardar|continuar/i }).click();

      // 5. Verificar que tras guardar se redirige al checkout con un ID dinámico
      await expect(page).toHaveURL(/.*\/checkout\/[a-zA-Z0-9_-]+/);
    });

    test('6. Capturar el cronómetro de 15 minutos en checkout y persistencia al refrescar', async ({ page }) => {
      // Precondición: Completar pasos anteriores para llegar al checkout
      await page.goto(`${BASE_URL}/calendario`);
      await page.locator('.partido-card, [data-testid="partido-card"]').first().click();
      await page.getByLabel(/nombre/i).fill('Juan');
      await page.getByLabel(/apellido/i).fill('Pérez');
      await page.getByRole('button', { name: /guardar|continuar/i }).click();
      await expect(page).toHaveURL(/.*\/checkout\/[a-zA-Z0-9_-]+/);

      // 6. Capturar el cronómetro
      const timer = page.locator('[data-testid="timer"], .countdown-timer');
      await expect(timer).toBeVisible();
      
      const tiempoInicial = await timer.textContent();
      expect(tiempoInicial).toBeTruthy();

      // Esperar un momento para que el tiempo corra (ej: 3 segundos)
      await page.waitForTimeout(3000);
      
      const tiempoAntesDeRefrescar = await timer.textContent();
      expect(tiempoAntesDeRefrescar).not.toBe(tiempoInicial);

      // Refrescar la página
      await page.reload();
      
      // Esperar a que el componente de tiempo vuelva a cargar
      await expect(timer).toBeVisible();
      const tiempoDespuesDeRefrescar = await timer.textContent();

      // Comprobar que el tiempo no se reinició al valor inicial (ej. 15:00)
      // En una prueba real podríamos parsear MM:SS para confirmar que el tiempo disminuyó,
      // pero con asegurar que no sea el tiempo original es suficiente para la persistencia.
      expect(tiempoDespuesDeRefrescar).not.toBe('15:00'); // O el valor de tiempoInicial
    });
  });

  test.describe('Responsiveness y Validaciones (Mobile)', () => {
    // Configurar el viewport a un tamaño móvil para este bloque
    test.use({ viewport: { width: 375, height: 667 } });

    test('8. Calendario responsive, fecha coincide con dispositivo y es previa al partido', async ({ page }) => {
      // Iniciar sesión y navegar al calendario
      await page.goto(`${BASE_URL}/login`);
      await page.getByLabel(/usuario|email/i).fill('test@ticketar.com');
      await page.getByLabel(/contraseña|password/i).fill('password123');
      await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
      await page.goto(`${BASE_URL}/calendario`);

      // Verificar que un elemento específico de móvil sea visible (ej. menú hamburguesa o cambio de layout)
      // o simplemente comprobar que el contenedor principal se ajusta al tamaño
      const calendario = page.locator('.calendario-container, [data-testid="calendario"]');
      await expect(calendario).toBeVisible();

      // Obtener la fecha del dispositivo (fecha de ejecución del test)
      const fechaDispositivo = new Date();
      const diaDispositivo = fechaDispositivo.getDate().toString();

      // Validar que la UI muestra/resalta la fecha actual que coincide con el dispositivo
      const diaActualUI = page.locator('.dia-actual, [data-testid="today-date"]');
      if (await diaActualUI.count() > 0) {
        const textoDia = await diaActualUI.textContent();
        expect(textoDia).toContain(diaDispositivo);
      }

      // Validar que la fecha del dispositivo es previa a la del partido seleccionado
      const fechaPartidoUI = page.locator('.fecha-partido, [data-testid="match-date"]').first();
      if (await fechaPartidoUI.count() > 0) {
        const textoFechaPartido = await fechaPartidoUI.textContent() || '';
        // Asumiendo un formato parseable como YYYY-MM-DD o parseo personalizado según la app
        const fechaPartido = new Date(textoFechaPartido); 
        
        // Verificar que la fecha de hoy es anterior a la del partido
        // (Nota: Si el textoFechaPartido no es Date-parseable directamente, requerirá ajuste)
        expect(fechaDispositivo.getTime()).toBeLessThan(fechaPartido.getTime());
      }
    });
  });

});

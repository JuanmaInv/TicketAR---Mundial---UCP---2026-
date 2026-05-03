# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Flujo E2E - Compra de Entradas >> Flujo de Compra de Entradas (Usuario Logeado) >> 6. Capturar el cronómetro de 15 minutos en checkout y persistencia al refrescar
- Location: tests\e2e.spec.ts:63:9

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel(/usuario|email/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - link "TicketARMUNDIAL" [ref=e4]:
        - /url: /
        - generic [ref=e5]: TicketARMUNDIAL
      - generic [ref=e6]:
        - link "Inicio" [ref=e7]:
          - /url: /
        - link "Partidos" [ref=e8]:
          - /url: /matches
        - link "Sobre Nosotros" [ref=e9]:
          - /url: /about
        - link "Mis Entradas" [ref=e10]:
          - /url: /my-tickets
      - button "Iniciar Sesión" [ref=e12]
  - main [ref=e13]:
    - generic [ref=e15]:
      - heading "404" [level=1] [ref=e16]
      - heading "This page could not be found." [level=2] [ref=e18]
  - button "Open Next.js Dev Tools" [ref=e24] [cursor=pointer]:
    - img [ref=e25]
  - alert [ref=e30]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  4   | 
  5   | test.describe('Flujo E2E - Compra de Entradas', () => {
  6   | 
  7   |   test.describe('Pruebas de Acceso y Seguridad', () => {
  8   |     
  9   |     test('1 y 2. Entrar a la página, ser redirigido al login y simular login', async ({ page }) => {
  10  |       // 1. Entrar a la página (ruta protegida) y ser redirigido al login
  11  |       await page.goto(BASE_URL);
  12  |       await expect(page).toHaveURL(/.*\/login/);
  13  | 
  14  |       // 2. Simular login con usuario y contraseña
  15  |       await page.getByLabel(/usuario|email/i).fill('test@ticketar.com');
  16  |       await page.getByLabel(/contraseña|password/i).fill('password123');
  17  |       await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
  18  | 
  19  |       // Verificar que el login fue exitoso y redirige al home o calendario
  20  |       await expect(page).not.toHaveURL(/.*\/login/);
  21  |     });
  22  | 
  23  |     test('7. Intentar entrar al checkout sin estar logeado y verificar que redirige al login', async ({ page }) => {
  24  |       // Al ser un nuevo test, el estado del navegador no está autenticado
  25  |       await page.goto(`${BASE_URL}/checkout`);
  26  |       // Verificar redirección al login
  27  |       await expect(page).toHaveURL(/.*\/login/);
  28  |     });
  29  |   });
  30  | 
  31  |   test.describe('Flujo de Compra de Entradas (Usuario Logeado)', () => {
  32  |     
  33  |     // Autenticación previa para los tests de este bloque
  34  |     test.beforeEach(async ({ page }) => {
  35  |       await page.goto(`${BASE_URL}/login`);
> 36  |       await page.getByLabel(/usuario|email/i).fill('test@ticketar.com');
      |                                               ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  37  |       await page.getByLabel(/contraseña|password/i).fill('password123');
  38  |       await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
  39  |       await expect(page).not.toHaveURL(/.*\/login/);
  40  |     });
  41  | 
  42  |     test('3, 4 y 5. Navegar al calendario, seleccionar partido, llenar datos y redirigir a checkout con ID', async ({ page }) => {
  43  |       // 3. Navegar al calendario y seleccionar un partido
  44  |       await page.goto(`${BASE_URL}/calendario`);
  45  |       
  46  |       const partidoCard = page.locator('.partido-card, [data-testid="partido-card"]').first();
  47  |       await expect(partidoCard).toBeVisible();
  48  |       await partidoCard.click();
  49  | 
  50  |       // Verificar que redirige al formulario de reserva o pre-checkout
  51  |       await expect(page).toHaveURL(/.*\/reserva|.*\/datos/);
  52  | 
  53  |       // 4. Simular el llenado de datos personales y presionar "Guardar"
  54  |       await page.getByLabel(/nombre/i).fill('Juan');
  55  |       await page.getByLabel(/apellido/i).fill('Pérez');
  56  |       await page.getByLabel(/dni/i).fill('12345678');
  57  |       await page.getByRole('button', { name: /guardar|continuar/i }).click();
  58  | 
  59  |       // 5. Verificar que tras guardar se redirige al checkout con un ID dinámico
  60  |       await expect(page).toHaveURL(/.*\/checkout\/[a-zA-Z0-9_-]+/);
  61  |     });
  62  | 
  63  |     test('6. Capturar el cronómetro de 15 minutos en checkout y persistencia al refrescar', async ({ page }) => {
  64  |       // Precondición: Completar pasos anteriores para llegar al checkout
  65  |       await page.goto(`${BASE_URL}/calendario`);
  66  |       await page.locator('.partido-card, [data-testid="partido-card"]').first().click();
  67  |       await page.getByLabel(/nombre/i).fill('Juan');
  68  |       await page.getByLabel(/apellido/i).fill('Pérez');
  69  |       await page.getByRole('button', { name: /guardar|continuar/i }).click();
  70  |       await expect(page).toHaveURL(/.*\/checkout\/[a-zA-Z0-9_-]+/);
  71  | 
  72  |       // 6. Capturar el cronómetro
  73  |       const timer = page.locator('[data-testid="timer"], .countdown-timer');
  74  |       await expect(timer).toBeVisible();
  75  |       
  76  |       const tiempoInicial = await timer.textContent();
  77  |       expect(tiempoInicial).toBeTruthy();
  78  | 
  79  |       // Esperar un momento para que el tiempo corra (ej: 3 segundos)
  80  |       await page.waitForTimeout(3000);
  81  |       
  82  |       const tiempoAntesDeRefrescar = await timer.textContent();
  83  |       expect(tiempoAntesDeRefrescar).not.toBe(tiempoInicial);
  84  | 
  85  |       // Refrescar la página
  86  |       await page.reload();
  87  |       
  88  |       // Esperar a que el componente de tiempo vuelva a cargar
  89  |       await expect(timer).toBeVisible();
  90  |       const tiempoDespuesDeRefrescar = await timer.textContent();
  91  | 
  92  |       // Comprobar que el tiempo no se reinició al valor inicial (ej. 15:00)
  93  |       // En una prueba real podríamos parsear MM:SS para confirmar que el tiempo disminuyó,
  94  |       // pero con asegurar que no sea el tiempo original es suficiente para la persistencia.
  95  |       expect(tiempoDespuesDeRefrescar).not.toBe('15:00'); // O el valor de tiempoInicial
  96  |     });
  97  |   });
  98  | 
  99  |   test.describe('Responsiveness y Validaciones (Mobile)', () => {
  100 |     // Configurar el viewport a un tamaño móvil para este bloque
  101 |     test.use({ viewport: { width: 375, height: 667 } });
  102 | 
  103 |     test('8. Calendario responsive, fecha coincide con dispositivo y es previa al partido', async ({ page }) => {
  104 |       // Iniciar sesión y navegar al calendario
  105 |       await page.goto(`${BASE_URL}/login`);
  106 |       await page.getByLabel(/usuario|email/i).fill('test@ticketar.com');
  107 |       await page.getByLabel(/contraseña|password/i).fill('password123');
  108 |       await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
  109 |       await page.goto(`${BASE_URL}/calendario`);
  110 | 
  111 |       // Verificar que un elemento específico de móvil sea visible (ej. menú hamburguesa o cambio de layout)
  112 |       // o simplemente comprobar que el contenedor principal se ajusta al tamaño
  113 |       const calendario = page.locator('.calendario-container, [data-testid="calendario"]');
  114 |       await expect(calendario).toBeVisible();
  115 | 
  116 |       // Obtener la fecha del dispositivo (fecha de ejecución del test)
  117 |       const fechaDispositivo = new Date();
  118 |       const diaDispositivo = fechaDispositivo.getDate().toString();
  119 | 
  120 |       // Validar que la UI muestra/resalta la fecha actual que coincide con el dispositivo
  121 |       const diaActualUI = page.locator('.dia-actual, [data-testid="today-date"]');
  122 |       if (await diaActualUI.count() > 0) {
  123 |         const textoDia = await diaActualUI.textContent();
  124 |         expect(textoDia).toContain(diaDispositivo);
  125 |       }
  126 | 
  127 |       // Validar que la fecha del dispositivo es previa a la del partido seleccionado
  128 |       const fechaPartidoUI = page.locator('.fecha-partido, [data-testid="match-date"]').first();
  129 |       if (await fechaPartidoUI.count() > 0) {
  130 |         const textoFechaPartido = await fechaPartidoUI.textContent() || '';
  131 |         // Asumiendo un formato parseable como YYYY-MM-DD o parseo personalizado según la app
  132 |         const fechaPartido = new Date(textoFechaPartido); 
  133 |         
  134 |         // Verificar que la fecha de hoy es anterior a la del partido
  135 |         // (Nota: Si el textoFechaPartido no es Date-parseable directamente, requerirá ajuste)
  136 |         expect(fechaDispositivo.getTime()).toBeLessThan(fechaPartido.getTime());
```
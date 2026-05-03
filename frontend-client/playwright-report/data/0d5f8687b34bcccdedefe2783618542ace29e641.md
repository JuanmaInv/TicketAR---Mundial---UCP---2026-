# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Flujo E2E - Compra de Entradas >> Pruebas de Acceso y Seguridad >> 1 y 2. Entrar a la página, ser redirigido al login y simular login
- Location: tests\e2e.spec.ts:9:9

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/login/
Received string:  "http://localhost:3000/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    8 × unexpected value "http://localhost:3000/"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - link "TicketARMUNDIAL" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]: TicketARMUNDIAL
      - generic [ref=e6]:
        - link "Inicio" [ref=e7] [cursor=pointer]:
          - /url: /
        - link "Partidos" [ref=e8] [cursor=pointer]:
          - /url: /matches
        - link "Sobre Nosotros" [ref=e9] [cursor=pointer]:
          - /url: /about
        - link "Mis Entradas" [ref=e10] [cursor=pointer]:
          - /url: /my-tickets
      - button "Iniciar Sesión" [ref=e12]
  - main [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - heading "Próximos Partidos" [level=1] [ref=e16]
        - paragraph [ref=e17]: Reserva tus entradas para la Copa del Mundo 2026. Selección de asientos en tiempo real y confirmación inmediata.
      - generic [ref=e18]:
        - generic [ref=e19]:
          - img [ref=e21]
          - generic [ref=e23]:
            - generic [ref=e24]: En Venta
            - generic [ref=e25]: $2000
          - heading "Argentina vs Argelia" [level=3] [ref=e26]
          - paragraph [ref=e27]:
            - text: "Ticket oficial para la Copa Mundial 2026. Sector exclusivo:"
            - strong [ref=e28]: VIP - Arrowhead Stadium (Kansas City)
            - text: . No te pierdas este encuentro histórico.
          - link "Seleccionar y Comprar" [ref=e29] [cursor=pointer]:
            - /url: /checkout/1
        - generic [ref=e30]:
          - img [ref=e32]
          - generic [ref=e34]:
            - generic [ref=e35]: En Venta
            - generic [ref=e36]: $7000
          - heading "Argentina vs Austria" [level=3] [ref=e37]
          - paragraph [ref=e38]:
            - text: "Ticket oficial para la Copa Mundial 2026. Sector exclusivo:"
            - strong [ref=e39]: Palco - AT&T Stadium (Arlington)
            - text: . No te pierdas este encuentro histórico.
          - link "Seleccionar y Comprar" [ref=e40] [cursor=pointer]:
            - /url: /checkout/2
        - generic [ref=e41]:
          - img [ref=e43]
          - generic [ref=e45]:
            - generic [ref=e46]: En Venta
            - generic [ref=e47]: $120
          - heading "Jordania vs Argentina" [level=3] [ref=e48]
          - paragraph [ref=e49]:
            - text: "Ticket oficial para la Copa Mundial 2026. Sector exclusivo:"
            - strong [ref=e50]: Popular - AT&T Stadium (Arlington)
            - text: . No te pierdas este encuentro histórico.
          - link "Seleccionar y Comprar" [ref=e51] [cursor=pointer]:
            - /url: /checkout/3
  - button "Open Next.js Dev Tools" [ref=e57] [cursor=pointer]:
    - img [ref=e58]
  - alert [ref=e62]
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
> 12  |       await expect(page).toHaveURL(/.*\/login/);
      |                          ^ Error: expect(page).toHaveURL(expected) failed
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
  36  |       await page.getByLabel(/usuario|email/i).fill('test@ticketar.com');
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
```
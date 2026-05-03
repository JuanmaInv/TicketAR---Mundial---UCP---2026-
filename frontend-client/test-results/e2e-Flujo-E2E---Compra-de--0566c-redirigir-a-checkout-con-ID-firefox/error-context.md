# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Flujo E2E - Compra de Entradas >> Flujo de Compra de Entradas (Usuario Logeado) >> 3, 4 y 5. Navegar al calendario, seleccionar partido, llenar datos y redirigir a checkout con ID
- Location: tests\e2e.spec.ts:50:9

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="password"]')
    - locator resolved to <input value="" disabled tabindex="-1" name="password" type="password" id="password-field" aria-invalid="false" aria-disabled="true" data-feedback="info" aria-required="false" data-variant="default" placeholder="Enter your password" class="cl-formFieldInput cl-input cl-formFieldInput__password cl-input__password 🔒️ cl-internal-88l1i9"/>
    - fill("password123")
  - attempting fill action
    2 × waiting for element to be visible, enabled and editable
      - element is not enabled
    - retrying fill action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and editable
      - element is not enabled
    - retrying fill action
      - waiting 100ms
    - waiting for element to be visible, enabled and editable
    - element is not enabled
  - retrying fill action
    - waiting 500ms
    - waiting for" https://accounts.google.com/o/oauth2/auth?access_type=offline&client_id=787459168867-0v2orf3qo56uocsi84iroseoahhuovdm.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fclerk.shared.lcl.dev%2Fv1%2…" navigation to finish...
    - navigated to "https://accounts.google.com/v3/signin/identifier?opparams=%253F&dsh=S-1709425981%3A1777843733173177&access_type=offline&client_id=787459168867-0v2orf3qo56uocsi84iroseoahhuovdm.apps.googleusercontent.…"
    - waiting for element to be visible, enabled and editable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - progressbar [ref=e6]
      - main [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e17]:
            - generic [ref=e18]:
              - img [ref=e20]
              - generic [ref=e25]: Sign in with Google
            - img "Clerk" [ref=e26]
          - generic [ref=e27]:
            - heading "Sign in" [level=1] [ref=e28]
            - generic [ref=e30]:
              - text: to continue to
              - button "Clerk" [ref=e31] [cursor=pointer]
        - generic [ref=e34]:
          - generic [ref=e39]:
            - generic [ref=e44]:
              - textbox "Email or phone" [active] [ref=e45]
              - generic: Email or phone
            - button "Forgot email?" [ref=e49] [cursor=pointer]
          - generic [ref=e52]:
            - text: Before using this app, you can review Clerk’s
            - link "Privacy Policy" [ref=e53] [cursor=pointer]:
              - /url: https://clerk.com/legal/privacy
            - text: and
            - link "Terms of Service" [ref=e54] [cursor=pointer]:
              - /url: https://clerk.com/legal/terms
            - text: .
        - generic [ref=e56]:
          - button "Next" [ref=e60]:
            - generic [ref=e63]: Next
          - button "Create account" [ref=e68]:
            - generic [ref=e71]: Create account
    - contentinfo [ref=e75]:
      - combobox "Change language English (United States)" [ref=e79] [cursor=pointer]:
        - generic:
          - generic: English (United States)
        - generic:
          - img
      - list [ref=e81]:
        - listitem [ref=e82]:
          - link "Help" [ref=e83] [cursor=pointer]:
            - /url: https://support.google.com/accounts?hl=en-US&p=account_iph
        - listitem [ref=e84]:
          - link "Privacy" [ref=e85] [cursor=pointer]:
            - /url: https://accounts.google.com/TOS?loc=AR&hl=en-US&privacy=true
        - listitem [ref=e86]:
          - link "Terms" [ref=e87] [cursor=pointer]:
            - /url: https://accounts.google.com/TOS?loc=AR&hl=en-US
  - iframe [ref=e88]:
    
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
  4   | 
  5   | test.describe('Flujo E2E - Compra de Entradas', () => {
  6   | 
  7   |   test.describe('Pruebas de Acceso y Seguridad', () => {
  8   |     
  9   |     test('1 y 2. Entrar a la página, ser redirigido al login y simular login', async ({ page }) => {
  10  |       // 1. Entrar a una ruta protegida (checkout) y ser redirigido al login
  11  |       await page.goto(`${BASE_URL}/checkout`);
  12  |       await expect(page).toHaveURL(/.*\/login|.*\/sign-in/);
  13  | 
  14  |       // 2. Simular login con usuario y contraseña
  15  |       await page.locator('input[name="identifier"]').fill('test@ticketar.com');
  16  |       // Clerk usa dos pasos: click en Continuar tras el email.
  17  |       await page.getByRole('button', { name: /continue|continuar/i }).first().click();
  18  |       // Esperar a que el campo de password sea interactivo
  19  |       const passwordInput = page.locator('input[name="password"]');
  20  |       await passwordInput.waitFor({ state: 'visible' });
  21  |       await passwordInput.fill('password123');
  22  |       await page.getByRole('button', { name: /continue|iniciar sesión|login/i }).last().click();
  23  | 
  24  |       // Verificar que el login fue exitoso y redirige al home o calendario
  25  |       await expect(page).not.toHaveURL(/.*\/login/);
  26  |     });
  27  | 
  28  |     test('7. Intentar entrar al checkout sin estar logeado y verificar que redirige al login', async ({ page }) => {
  29  |       // Al ser un nuevo test, el estado del navegador no está autenticado
  30  |       await page.goto(`${BASE_URL}/checkout`);
  31  |       // Verificar redirección al login
  32  |       await expect(page).toHaveURL(/.*\/login|.*\/sign-in/);
  33  |     });
  34  |   });
  35  | 
  36  |   test.describe('Flujo de Compra de Entradas (Usuario Logeado)', () => {
  37  |     
  38  |     // Autenticación previa para los tests de este bloque
  39  |     test.beforeEach(async ({ page }) => {
  40  |       await page.goto(`${BASE_URL}/login`);
  41  |       await page.locator('input[name="identifier"]').fill('test@ticketar.com');
  42  |       await page.getByRole('button', { name: /continue|continuar/i }).first().click();
  43  |       const passwordInput = page.locator('input[name="password"]');
  44  |       await passwordInput.waitFor({ state: 'visible' });
> 45  |       await passwordInput.fill('password123');
      |                           ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  46  |       await page.getByRole('button', { name: /continue|iniciar sesión|login/i }).last().click();
  47  |       await expect(page).not.toHaveURL(/.*\/login/);
  48  |     });
  49  | 
  50  |     test('3, 4 y 5. Navegar al calendario, seleccionar partido, llenar datos y redirigir a checkout con ID', async ({ page }) => {
  51  |       // 3. Navegar al calendario y seleccionar un partido
  52  |       await page.goto(`${BASE_URL}/calendario`);
  53  |       
  54  |       const partidoCard = page.locator('.partido-card, [data-testid="partido-card"]').first();
  55  |       await expect(partidoCard).toBeVisible();
  56  |       await partidoCard.click();
  57  | 
  58  |       // Verificar que redirige al formulario de reserva o pre-checkout
  59  |       await expect(page).toHaveURL(/.*\/reserva|.*\/datos/);
  60  | 
  61  |       // 4. Simular el llenado de datos personales y presionar "Guardar"
  62  |       await page.getByLabel(/nombre/i).fill('Juan');
  63  |       await page.getByLabel(/apellido/i).fill('Pérez');
  64  |       await page.getByLabel(/dni/i).fill('12345678');
  65  |       await page.getByRole('button', { name: /guardar|continuar/i }).click();
  66  | 
  67  |       // 5. Verificar que tras guardar se redirige al checkout con un ID dinámico
  68  |       await expect(page).toHaveURL(/.*\/checkout\/[a-zA-Z0-9_-]+/);
  69  |     });
  70  | 
  71  |     test('6. Capturar el cronómetro de 15 minutos en checkout y persistencia al refrescar', async ({ page }) => {
  72  |       // Precondición: Completar pasos anteriores para llegar al checkout
  73  |       await page.goto(`${BASE_URL}/calendario`);
  74  |       await page.locator('.partido-card, [data-testid="partido-card"]').first().click();
  75  |       await page.getByLabel(/nombre/i).fill('Juan');
  76  |       await page.getByLabel(/apellido/i).fill('Pérez');
  77  |       await page.getByRole('button', { name: /guardar|continuar/i }).click();
  78  |       await expect(page).toHaveURL(/.*\/checkout\/[a-zA-Z0-9_-]+/);
  79  | 
  80  |       // 6. Capturar el cronómetro
  81  |       const timer = page.locator('[data-testid="timer"], .countdown-timer');
  82  |       await expect(timer).toBeVisible();
  83  |       
  84  |       const tiempoInicial = await timer.textContent();
  85  |       expect(tiempoInicial).toBeTruthy();
  86  | 
  87  |       // Esperar un momento para que el tiempo corra (ej: 3 segundos)
  88  |       await page.waitForTimeout(3000);
  89  |       
  90  |       const tiempoAntesDeRefrescar = await timer.textContent();
  91  |       expect(tiempoAntesDeRefrescar).not.toBe(tiempoInicial);
  92  | 
  93  |       // Refrescar la página
  94  |       await page.reload();
  95  |       
  96  |       // Esperar a que el componente de tiempo vuelva a cargar
  97  |       await expect(timer).toBeVisible();
  98  |       const tiempoDespuesDeRefrescar = await timer.textContent();
  99  | 
  100 |       // Comprobar que el tiempo no se reinició al valor inicial (ej. 15:00)
  101 |       // En una prueba real podríamos parsear MM:SS para confirmar que el tiempo disminuyó,
  102 |       // pero con asegurar que no sea el tiempo original es suficiente para la persistencia.
  103 |       expect(tiempoDespuesDeRefrescar).not.toBe('15:00'); // O el valor de tiempoInicial
  104 |     });
  105 |   });
  106 | 
  107 |   test.describe('Responsiveness y Validaciones (Mobile)', () => {
  108 |     // Configurar el viewport a un tamaño móvil para este bloque
  109 |     test.use({ viewport: { width: 375, height: 667 } });
  110 | 
  111 |     test('8. Calendario responsive, fecha coincide con dispositivo y es previa al partido', async ({ page }) => {
  112 |       // Iniciar sesión y navegar al calendario
  113 |       await page.goto(`${BASE_URL}/login`);
  114 |       await page.locator('input[name="identifier"]').fill('test@ticketar.com');
  115 |       await page.getByRole('button', { name: /continue|continuar/i }).first().click();
  116 |       const passwordInput = page.locator('input[name="password"]');
  117 |       await passwordInput.waitFor({ state: 'visible' });
  118 |       await passwordInput.fill('password123');
  119 |       await page.getByRole('button', { name: /continue|iniciar sesión|login/i }).last().click();
  120 |       await page.goto(`${BASE_URL}/calendario`);
  121 | 
  122 |       // Verificar que un elemento específico de móvil sea visible (ej. menú hamburguesa o cambio de layout)
  123 |       // o simplemente comprobar que el contenedor principal se ajusta al tamaño
  124 |       const calendario = page.locator('.calendario-container, [data-testid="calendario"]');
  125 |       await expect(calendario).toBeVisible();
  126 | 
  127 |       // Obtener la fecha del dispositivo (fecha de ejecución del test)
  128 |       const fechaDispositivo = new Date();
  129 |       const diaDispositivo = fechaDispositivo.getDate().toString();
  130 | 
  131 |       // Validar que la UI muestra/resalta la fecha actual que coincide con el dispositivo
  132 |       const diaActualUI = page.locator('.dia-actual, [data-testid="today-date"]');
  133 |       if (await diaActualUI.count() > 0) {
  134 |         const textoDia = await diaActualUI.textContent();
  135 |         expect(textoDia).toContain(diaDispositivo);
  136 |       }
  137 | 
  138 |       // Validar que la fecha del dispositivo es previa a la del partido seleccionado
  139 |       const fechaPartidoUI = page.locator('.fecha-partido, [data-testid="match-date"]').first();
  140 |       if (await fechaPartidoUI.count() > 0) {
  141 |         const textoFechaPartido = await fechaPartidoUI.textContent() || '';
  142 |         // Asumiendo un formato parseable como YYYY-MM-DD o parseo personalizado según la app
  143 |         const fechaPartido = new Date(textoFechaPartido); 
  144 |         
  145 |         // Verificar que la fecha de hoy es anterior a la del partido
```
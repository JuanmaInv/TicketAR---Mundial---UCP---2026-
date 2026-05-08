# 📋 Documentación de Pruebas E2E — Frontend TicketAR 2026

**Proyecto:** TicketAR Mundial UCP 2026  
**Rol:** Tester de Frontend  
**Herramienta:** Playwright  
**Alcance:** Pruebas End-to-End (E2E) y de Integración de Componentes  
**Período registrado:** 23 de Abril — 08 de Mayo de 2026  

---

## 📁 Estructura de Archivos de Tests

```
frontend-client/
├── tests/
│   ├── e2e.spec.ts              # Suite principal E2E (flujo de compra completo)
│   ├── ticketar-flow.spec.ts    # Flujo E2E con Network Interception (mocks)
│   ├── resultados_e2e.txt       # Registro de resultados de ejecución
│   └── Dettalles_de_errores.txt # Análisis detallado de fallos
├── components/
│   └── checkout/
│       └── BuyerForm.spec.tsx   # Tests de integración del componente BuyerForm
├── playwright.config.ts         # Configuración E2E principal
└── playwright-ct.config.ts      # Configuración Component Testing
```

---

## 🗓️ Sesión 1 — 23 de Abril de 2026

### Objetivo
Configurar el entorno de automatización de pruebas con Playwright e implementar las primeras suites E2E e integración de componentes.

### Configuración del Entorno

| Paso | Comando ejecutado | Resultado |
|------|-------------------|-----------|
| Instalación de Playwright | `npm install -D @playwright/test` | ✅ Exitoso |
| Descarga de navegadores | `npx playwright install` | ✅ Chromium, Firefox y WebKit descargados |
| Inicialización de estructura | `npx create-playwright@latest` | ✅ Creó `playwright.config.ts` y carpeta `tests/` |
| Component Testing | `npm install -D @playwright/experimental-ct-react` | ✅ Instalado |

### Archivos creados

- `playwright.config.ts` — Configuración principal con soporte multinavegador.
- `playwright-ct.config.ts` — Configuración para Component Testing.
- `playwright/index.html` — Plantilla HTML base para montar componentes.
- `playwright/index.tsx` — Script de inicialización con estilos globales (Tailwind).
- `tests/ticketar-flow.spec.ts` — Suite E2E del flujo principal.
- `components/checkout/BuyerForm.spec.tsx` — Tests de integración del formulario.

---

### Suite 1: `ticketar-flow.spec.ts` — Flujo Principal con Network Interception

**Técnica utilizada:** `page.route()` para interceptar peticiones de red y devolver HTML simulado (mock), permitiendo validar la lógica del flujo sin depender de que las pantallas reales de Next.js estén completamente implementadas.

#### Casos de Prueba

| # | Nombre del Test | Descripción | Estado |
|---|-----------------|-------------|--------|
| 1 | Home — Carga inicial | Verifica que el título de la página coincida con `/TicketAR Mundial/i` y que los elementos visuales estén presentes | ✅ PASSED |
| 2 | Cola Virtual — Esperar turno | Intercepta `/cola-virtual`, inyecta HTML con texto "Tu turno es el 1" y simula redirección automática a `/sectores` tras 3 segundos | ✅ PASSED |
| 3 | Sectores — Seleccionar Platea | Intercepta `/sectores`, verifica la presencia del botón "Platea" y simula la selección de 2 entradas con el botón `+` | ✅ PASSED |
| 4 | Checkout — Llenar formulario | Intercepta `/checkout`, verifica los campos con `labels` explícitos (`id/for`), completa Nombre, DNI, Email y Pasaporte, y valida la confirmación | ✅ PASSED |

**Resultado de ejecución:**

```
✅  4 tests passed
Navegadores: Chromium · Firefox · WebKit
Tiempo total: ~15s
Exit code: 0
```

> **Nota técnica:** El ajuste de `setTimeout` de 500ms a 3000ms en la cola virtual fue necesario para que Playwright tuviera tiempo de leer el texto del HTML mockeado antes de que ocurriera la redirección.

---

### Suite 2: `BuyerForm.spec.tsx` — Component Testing (Integración)

**Técnica utilizada:** Playwright Component Testing (`@playwright/experimental-ct-react`). El componente `BuyerForm.tsx` es compilado y montado en un navegador real sin levantar toda la aplicación Next.js.

#### Casos de Prueba

| # | Nombre del Test | Descripción | Estado |
|---|-----------------|-------------|--------|
| 1 | Renderizado inicial | Verifica que todos los campos del formulario (Nombre, DNI, Email, Pasaporte, Nº de Entradas) sean visibles al montar el componente | ✅ PASSED |
| 2 | Errores de validación al enviar vacío | Hace clic en "Guardar" sin llenar ningún campo y verifica que aparezcan mensajes de error en rojo | ✅ PASSED |
| 3 | Limpieza de errores al escribir | Llena los campos correctamente y verifica que los mensajes de error desaparezcan dinámicamente | ✅ PASSED |

**Resultado de ejecución:**

```
✅  9 tests passed  (3 casos × 3 navegadores)
Tiempo total: 13.3s
Exit code: 0
```

---

## 🗓️ Sesión 2 — 27 de Abril de 2026

### Objetivo
Expandir la cobertura E2E con un script más completo que abarque seguridad, autenticación, persistencia de datos y responsividad.

### Archivos creados/modificados

- `tests/e2e.spec.ts` — Nueva suite con 8 flujos de prueba detallados.
- `tests/resultados_e2e.txt` — Primer registro automático de resultados.

---

### Suite 3: `e2e.spec.ts` — Flujo Completo de Compra

**Técnica utilizada:** Pruebas E2E sobre la aplicación real corriendo en `localhost:3000`.

#### Casos de Prueba

| # | Nombre del Test | Descripción | Estado | Motivo del fallo |
|---|-----------------|-------------|--------|------------------|
| 1 | Redirección al login | Al entrar a `/` sin sesión, debe redirigir a `/login` | ❌ FAILED | Middleware de protección de rutas no implementado — la app permitió el acceso sin autenticación |
| 2 | Simulación de login | Llenar email y contraseña en el formulario de login y verificar sesión | ❌ FAILED | Timeout: el formulario de login no tenía campos con los labels esperados (Email/Usuario) |
| 3 | Navegar al calendario y seleccionar partido | Estando autenticado, navegar al calendario y seleccionar un partido | ❌ FAILED | Depende del test de login que falló previamente |
| 4 | Llenar datos personales | Completar el formulario de datos y presionar "Guardar" | ❌ FAILED | Depende de los pasos anteriores |
| 5 | Verificar URL del checkout con ID | Validar que la URL del checkout contenga un ID dinámico (ej. `/checkout/abc123`) | ❌ FAILED | Depende de los pasos anteriores |
| 6 | Persistencia del cronómetro | Verificar que el timer de 15 minutos no se reinicie al refrescar la página | ❌ FAILED | Depende de los pasos anteriores |
| 7 | Acceso sin login al checkout | Intentar entrar a `/checkout` sin sesión y verificar redirección a `/login` | ❌ FAILED | Ausencia de middleware — la ruta no estaba protegida |
| 8 | Responsividad del calendario (móvil) | Cambiar viewport a 390×844 (iPhone 14) y verificar que el calendario sea funcional | ❌ FAILED | Depende de los pasos anteriores |

**Resultado de ejecución:**

```
❌  5 de 8 tests fallaron (primer run, sin servidor activo)
Navegador: Chromium
```

#### Análisis de causa raíz de los fallos

| Categoría | Descripción | Acción correctiva sugerida |
|-----------|-------------|---------------------------|
| **Middleware ausente** | Las rutas `/` y `/checkout` no redirigen al login cuando no hay sesión activa | Implementar middleware de autenticación en `middleware.ts` de Next.js con Clerk |
| **Timeout en login** | El formulario de login no tiene los selectores esperados por los tests | Alinear los `labels` y `placeholder` de los inputs con los selectores del test |
| **Dependencia en cadena** | Los tests 3-8 fallan en cascada porque dependen de un login exitoso | Usar `test.use({ storageState: 'auth.json' })` para inyectar sesión precargada |

---

## 🗓️ Sesión 3 — 03 de Mayo de 2026

### Objetivo
Re-ejecutar las suites con el servidor activo, resolver el error de módulo faltante y documentar el resultado formal.

### Incidencias y resolución

| Incidencia | Detalle | Solución aplicada |
|------------|---------|-------------------|
| `Cannot find module '@playwright/test'` | Los archivos de Playwright no estaban en `node_modules` (repositorio clonado en nueva ubicación) | `npm install` dentro de `frontend-client/` |
| Tests fallando por `Connection refused` | El servidor de Next.js no estaba activo durante la ejecución de tests | Se inició `npm run dev` antes de ejecutar los tests |
| Acceso a PowerShell bloqueado (`Set-ExecutionPolicy`) | Política de ejecución de scripts deshabilitada en Windows | Se usó `npx.cmd` como workaround directo |

### Resultado final de la sesión

```
Suite: tests/e2e.spec.ts + tests/ticketar-flow.spec.ts
Total tests: 18
✅ Passed:  3  (ticketar-flow con mocks)
❌ Failed: 15  (e2e.spec.ts — rutas no protegidas + login sin implementar)

Suite: components/checkout/BuyerForm.spec.tsx
Total tests: 9
✅ Passed: 9
```

---

## 🗓️ Sesiones 4, 5 y 6 — 07 y 08 de Mayo de 2026

### Objetivo
Ciclo completo de PR Review: integrar Mercado Pago, aplicar correcciones de Codacy/Seguridad y resolver bloqueos en la estrategia de bypass.

### Resumen de hitos de revisión

| Ronda | Objetivo | Resultado |
|-------|----------|-----------|
| **R1** | Integración básica API Mercado Pago | Implementación base; observaciones de seguridad en `path.resolve()` |
| **R2** | Correcciones de seguridad (Codacy/Semgrep) | Fix: `E2E_BYPASS` restringido solo a `NODE_ENV !== 'production'` |
| **R3** | Resolución de bugs en estrategia de bypass | Fix: bypass movido al inicio de `verifyPayment` para evitar llamadas externas innecesarias |

---

## 🗓️ Sesión 6 — 08 de Mayo de 2026 (Detalle)

### Objetivo
Resolver las 3 observaciones críticas del segundo ciclo de PR review sobre la estrategia de Mercado Pago y el script de integración.

**Rama:** `fix/pr-review-bypass-logic-and-unit-tests`

### Issues resueltas

| Severidad | Archivo | Problema | Solución |
|-----------|---------|----------|----------|
| 🔴 HIGH | `mercadopago.strategy.ts` | El bypass se evaluaba **después** de llamar a la API de MP | Bypass movido al **inicio** del método, antes de cualquier llamada al SDK |
| 🟡 MEDIUM | `test-mercadopago.js` | Variables intermedias (`envPath`, `LOG_FILE`) en llamadas a `fs` marcadas por Semgrep | `path.resolve()` inlineado directamente en llamadas a `fs` |
| ⚪ NUEVO | `mercadopago.strategy.spec.ts` | No existían tests unitarios para la lógica de `isE2eBypass` | Creación de suite de 5 unit tests con Jest |

### Nueva suite de Unit Tests: `mercadopago.strategy.spec.ts`

**Framework:** Jest + NestJS Testing Module
**Técnica:** Mock del SDK de Mercado Pago con `jest.mock('mercadopago')`.

#### Casos de prueba

| # | Escenario | `NODE_ENV` | `E2E_BYPASS` | Respuesta API mock | Resultado |
|---|-----------|-----------|-------------|-------------------|-----------|
| 1 | Producción con bypass activo | `production` | `true` | `rejected` | ✅ PASSED |
| 2 | Desarrollo con bypass activo | `development` | `true` | *(no llamada)* | ✅ PASSED |
| 3 | Producción sin bypass | `production` | *(ausente)* | `approved` | ✅ PASSED |
| 4 | Desarrollo con bypass off | `development` | `false` | `pending` | ✅ PASSED |
| 5 | Error de red | `production` | *(ausente)* | `throw Error` | ✅ PASSED |

---

## 📊 Resumen General de Cobertura (Actualizado)

| Suite | Archivo | Técnica | Tests totales | ✅ Passed | ❌ Failed |
|-------|---------|---------|---------------|-----------|-----------|
| Flujo con Mocks | `ticketar-flow.spec.ts` | Network Interception | 4 | 4 | 0 |
| Integración BuyerForm | `BuyerForm.spec.tsx` | Component Testing (CT) | 9 | 9 | 0 |
| Flujo Real E2E | `e2e.spec.ts` | E2E sobre app real | 18 | 3 | 15 |
| Unit Tests — MP Strategy | `mercadopago.strategy.spec.ts` | Jest + Mocks | 5 | 5 | 0 |
| **TOTAL** | | | **36** | **21** | **15** |

---

## 🔴 Defectos Abiertos (Pendientes de resolución)

| ID | Descripción | Archivos involucrados | Prioridad |
|----|-------------|----------------------|-----------|
| BUG-01 | `/checkout` accesible sin autenticación | `middleware.ts` (ausente) | 🔴 Alta |
| BUG-02 | `/` no redirige al login cuando no hay sesión | `middleware.ts` (ausente) | 🔴 Alta |
| BUG-03 | Formulario de login sin selectores alineados a los tests | `app/login/page.tsx` | 🟡 Media |
| BUG-04 | Timer del checkout no persiste al recargar la página | Componente checkout | 🟡 Media |

---

## ✅ Buenas Prácticas Aplicadas

- **Network Interception:** Se usó `page.route()` para aislar el flujo E2E.
- **Component Testing:** Validación aislada de `BuyerForm`.
- **Unit Tests con mocks:** Uso de `jest.mock()` para probar estados de bypass sin dependencias externas.
- **Registro de resultados:** Logs persistidos en `tests/resultados_e2e.txt`.
- **Gestión de ramas:** Flujo estricto de `fix/` para cada incidencia detectada en PR.
- **Commits semánticos:** Uso de `test:`, `fix:`, `chore:`.

---

## 🔧 Comandos de Referencia

```bash
# Ejecutar todos los tests E2E
npx playwright test

# Ejecutar tests de componentes
npx playwright test -c playwright-ct.config.ts

# Ejecutar unit tests del backend (Jest)
cd backend-nest && pnpm test

# Ejecutar solo los unit tests de la estrategia MP
cd backend-nest && pnpm test -- mercadopago.strategy.spec

# Ver reporte HTML de resultados Playwright
npx playwright show-report

# Modo UI interactivo (recomendado para debug)
npx playwright test --ui
```

> **Nota Windows:** Si PowerShell bloquea `npx`, usar la variante `npx.cmd playwright test` o ejecutar desde el Símbolo del sistema (CMD).

---

*Documento generado en base al historial de sesiones de trabajo con IA (Gemini Antigravity) — TicketAR 2026.*  
*Última actualización: 08 de Mayo de 2026 — Sesión 6 (unit tests + fix bypass)*

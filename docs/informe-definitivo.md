# Informe Definitivo: TicketAR - Mundial 2026

> **Propósito de este documento:** Guía completa para que cualquier desarrollador nuevo pueda incorporarse al proyecto backend, entender su arquitectura, y extenderlo sin romper nada.

---

## 🎯 Visión y Lógica de Negocio

Desarrollar una plataforma de venta de entradas enfocada en la seguridad y eliminación de la reventa ilegal.

- **Validación:** Entrada obligatoria con Pasaporte.
- **Regla Crítica:** Máximo 1 entrada por sesión por usuario.
- **Reserva:** El servidor bloquea el lugar por tiempo limitado (15 min) hasta confirmar pago.
- **Sectores:** Control de capacidad estricto por PLATEA, PALCO, POPULAR y PRENSA.
- **Entregable:** Generación de código QR enviado por correo tras confirmar el pago.
- **Reventa:** Sistema oficial integrado en la plataforma con comisión.
- **Inventario Dinámico:** El stock se gestiona por la relación única `Partido-Sector`, permitiendo precios y capacidades independientes por cada encuentro.

---

## 🛠️ Stack Tecnológico (Monorepo)

| Rol | Tecnología | Carpeta |
|-----|-----------|---------|
| Backend | NestJS (Modular) | `/backend-nest` |
| Frontend | Next.js + Tailwind | `/frontend-client` |
| Base de Datos / Auth | Supabase | — |
| Pagos | Stripe (Int) / Mercado Pago (Local) | — |
| Testing E2E | Playwright | — |
| Métricas | Grafana | — |

> ⚠️ **Regla de oro:** No almacenar datos de tarjetas. No usar Clerk para autenticación.

---

## 🌐 Arquitectura de Integración (Fullstack)

Para entender cómo funciona el ecosistema de **TicketAR**, dividimos la responsabilidad en tres pilares fundamentales:

### 1. El Triángulo de Conectividad
*   **Base de Datos (Supabase):** El corazón del sistema. Almacena tablas de partidos, usuarios y entradas. Gestiona la persistencia real de los datos.
*   **Backend (NestJS):** El guardián y cerebro. Es el único que tiene la "llave maestra" (`service_role`) para escribir en la base de datos de forma segura. Valida reglas de negocio y procesa pagos.
*   **Frontend (Next.js):** La cara del proyecto. Captura la intención del usuario y se comunica con el Backend mediante peticiones HTTP (REST) a `http://localhost:3000`.

### 2. Flujo de Datos (Ejemplo: Compra de Entrada)
1.  **Frontend:** El usuario elige un asiento y el Front envía un `POST /entradas`.
2.  **Backend:** Recibe el pedido, valida que el partido exista y que el usuario no tenga ya otra entrada para ese partido.
3.  **Backend ↔ Supabase:** Si todo es válido, el Backend escribe la reserva en la base de datos y activa el bloqueo de 15 minutos.
4.  **Backend:** Devuelve la confirmación al usuario para que proceda al pago.

### 3. El Rol del "Guardián" (NestJS)
A diferencia de otros proyectos donde el Front habla directo con la DB, aquí **NestJS actúa como intermediario crítico**:
*   **Security:** El Front solo conoce la `anon_key`, mientras que el Backend usa la `service_role_key`.
*   **Integridad:** Centralizamos validaciones complejas (como el chequeo de pasaportes) en un solo lugar.
*   **Pagos:** El Backend procesa las confirmaciones de pasarelas antes de marcar un ticket como `PAGADO` en la DB.

---

## 🚀 Inicio Rápido (Para el Desarrollador Nuevo)

Si acabas de clonar el repositorio, seguí estos pasos en orden:

### 1. Instalar dependencias del backend

```bash
cd backend-nest
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase y Stripe/MercadoPago
```

### 3. Levantar el servidor en modo desarrollo

```bash
pnpm run start:dev
```

El backend corre en `http://localhost:3000`. El servidor se recarga automáticamente al guardar cambios (hot reload).

### 4. Verificar que funciona

Abrir en el browser o con cualquier cliente HTTP:

```
GET http://localhost:3000/partidos
GET http://localhost:3000/sectores
```

Deben devolver un array JSON con los datos de semilla cargados.

### 5. Correr los tests

```bash
pnpm run test
```

Resultado esperado: **6 passed, 0 failed**.

### 6. Verificar que compila sin errores

```bash
pnpm run build
```

Si dice `Found 0 errors` o termina sin output de error, el TypeScript está limpio.

---

## 📂 Gestión de Dependencias y Entorno

- **Instalación:** Ejecutar `pnpm install` **solo dentro de la carpeta del rol** (`/backend-nest` o `/frontend-client`). No instalar desde la raíz del monorepo.
- **Seguridad:** `.env` está en `.gitignore`. **NUNCA subir llaves privadas al repositorio.**
- **Plantilla:** Usar `.env.example` para que el equipo sepa qué variables configurar.
- **Variables necesarias:** Ver `.env.example` para la lista actualizada.

---

## ⚙️ CI/CD y Workflows de Integración

- **Integración Continua:** GitHub Actions. El archivo `backend-ci.yml` corre automáticamente en cada Push o PR hacia ramas `feat/**`.
- **Qué valida:** Instala dependencias, corre `pnpm run build` y `pnpm run test`.
- **Regla:** Un PR no puede mergearse si la CI falla.

---

## 🌿 Flujo de Git y Colaboración

1. **Branching:** Ramas por tarea: `feat/nombre-feature`, `fix/nombre-bug`, `chore/nombre-tarea`.
2. **Protección:** `main` está protegida. Todo cambio entra por Pull Request con al menos 1 revisión.
3. **Issues:** Una tarea = Una Issue en GitHub. Usar "Relationships" para vincular issues relacionadas.
4. **Sync:** Sincronizar con `main` diariamente (`git pull --rebase origin main`).
5. **Commits semánticos:** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
6. **Docs-as-Code:** Las reglas de negocio viajan en `/docs` junto al código.

---

## 🏗️ Arquitectura del Backend (NestJS por Capas)

El backend usa una **Arquitectura por Capas** organizada en módulos independientes. Cada capa tiene una responsabilidad única y no puede saltarse.

```
HTTP Request
     ↓
[ DTO ]          ← Valida los datos de entrada (escudo protector)
     ↓
[ Controller ]   ← Enruta la petición al servicio correcto (solo delega)
     ↓
[ Service ]      ← Aplica la lógica de negocio (el cerebro)
     ↓
[ Database ]     ← Persiste los datos (Supabase)
```

### 1. DTOs (Data Transfer Objects)
Antes de escribir lógica, definimos DTOs (`.dto.ts`). Son clases de TypeScript que validan los datos que entran a la API (usando `class-validator`). 
- *Misión:* Actúan como un "escudo" de seguridad. Implementan el principio de **Zero Trust**: el servidor solo acepta los campos definidos (ej. `userId`, `partidoId`, `sectorId`) e ignora el resto (ej. `status`, `qrCode`).
- *Validación Estricta:* Se utiliza `@IsUUID('4')` para prevenir inyecciones y asegurar que los identificadores sigan el estándar de Supabase.
- *Configuración Global:* Se utiliza el `ValidationPipe` en `main.ts` con `whitelist: true` para limpiar automáticamente cualquier campo no deseado enviado por el cliente.

### 2. Roles de cada capa

| Archivo | Rol | Regla |
|---------|-----|-------|
| `.dto.ts` | Valida el JSON de entrada | Nunca tiene lógica de negocio |
| `.controller.ts` | Recibe HTTP y delega al servicio | Nunca accede a la DB directamente |
| `.service.ts` | Toda la lógica de negocio | Única capa que toca la DB |
| `.entity.ts` | Define la forma de los datos en DB | Refleja exactamente las columnas de Supabase |
| `.module.ts` | Agrupa y conecta las piezas | Se registra en `AppModule` |

---

## 🎨 Patrones de Diseño de Software

Para garantizar que el sistema sea mantenible, testeable y escalable, hemos aplicado patrones de diseño de nivel empresarial que desacoplan la lógica de negocio de la infraestructura:

### 1. Patrón Repositorio (Repository Pattern)
Es el pilar fundamental de nuestra capa de persistencia. Actúa como una capa de mediación entre la lógica de negocio (`Service`) y la fuente de datos externa (`Supabase`).

- **Implementación:** Definimos interfaces (contratos) como `IPartidosRepository` y una implementación concreta `SupabasePartidosRepository`.
- **Inyección de Dependencias:** El servicio pide la interfaz (`@Inject('IPartidosRepository')`), lo que permite cambiar la implementación sin afectar el código que la consume.
- **Beneficios:** 
    - **Desacoplamiento:** El servicio no conoce los detalles de implementación de Supabase (tablas, consultas, etc.).
    - **Testabilidad:** Permite inyectar repositorios "mockeados" en los tests unitarios.

### 2. Patrón Adapter (Adaptador)
Lo utilizamos para normalizar los datos que vienen de fuentes externas antes de que lleguen a nuestro dominio.

- **El Problema:** Supabase devuelve datos en *snake_case* (ej: `fecha_partido`), pero nuestro dominio usa *camelCase* (ej: `fechaPartido`).
- **La Solución:** El método `mapToEntity` dentro de los repositorios actúa como un **Adaptador de Datos**, traduciendo el esquema físico de la base de datos al esquema lógico de la aplicación.

### 3. Patrón State (Estado)
Implementado específicamente para gestionar el ciclo de vida crítico de las entradas (Reservada -> Pagada -> Cancelada).

- **Propósito:** Encapsular las reglas de transición de estados. Por ejemplo, evitar que una entrada cancelada (por expiración de 15 min) pueda ser pagada.
- **Estructura:**
    - `TicketState` (Interfaz): Define acciones como `pagar()` y `cancelar()`.
    - `ReservadoState`, `PagadoState`, `CanceladoState`: Implementaciones concretas que lanzan excepciones si la acción es ilegal.
- **Beneficio:** Centraliza la lógica de negocio y evita que el `Service` se llene de condicionales `if/else` frágiles.

### 4. Singleton Pattern
NestJS garantiza que servicios críticos como `SupabaseService` se instancien una sola vez por toda la aplicación, optimizando la gestión de conexiones y memoria.

---

## 🧩 Módulos Implementados y sus Responsabilidades

Para mantener el principio de **Responsabilidad Única**, el sistema se divide en los siguientes módulos lógicos:

1. **Users (Usuarios):** Gestiona el perfil del hincha. Su función principal es vincular la cuenta del usuario con su número de pasaporte validado.
2. **Matches (Partidos):** Es el catálogo de eventos. Define qué selecciones juegan, en qué estadio y en qué fecha. Sin un partido, no se pueden emitir tickets.
3. **Stadium-Sectors (Sectores del Estadio):** Controla el inventario y los precios base de la estructura física del estadio.
4. **Passport-Credentials (Validación de Identidad):** Actúa como un "oráculo" de seguridad. Simula la conexión con una API externa para verificar pasaportes.
5. **Tickets (Entradas y Reservas):** El corazón de la lógica de negocio. Maneja el estado del ticket, aplica la reserva de 15 minutos y hace cumplir la regla de "1 entrada por usuario".
6. **Payments (Pagos):** Se encarga de la pasarela de pago. Una vez confirmado, ordena el cambio de estado a "Pagado".

---

## 📊 Gestión Automatizada de Inventario (Match-Sector Logic)

Esta funcionalidad es el núcleo de la estabilidad del sistema TicketAR. Permite que cada encuentro del Mundial gestione su propia disponibilidad de forma independiente y segura.

### 1. El Concepto: Desacoplamiento de Stock
Para evitar conflictos de concurrencia y permitir flexibilidad, hemos separado la definición física del estadio de la disponibilidad por encuentro:
*   **Tabla `sectores_estadio` (El Molde):** Define la capacidad total teórica (ej: 20,000 lugares) y el precio base de un sector.
*   **Tabla `partido_sectores` (El Inventario Real):** Es la tabla donde ocurre la magia. Guarda cuántos lugares quedan **específicamente** para un partido "X" en un sector "Y".

### 2. Automatización mediante Trigger (Paso a Paso)
Hemos implementado un patrón de **Automatización de Lado del Servidor (Supabase/Postgres)** para garantizar que nunca exista un partido sin entradas disponibles:

1.  **Evento de Creación:** Un administrador o proceso automático inserta un nuevo registro en la tabla `partidos`.
2.  **Disparo del Trigger (`tr_inicializar_inventario_partido`):** El motor de la base de datos detecta la inserción y detiene el proceso un milisegundo para ejecutar la lógica de inventario.
3.  **Ejecución de Función (`fn_inicializar_inventario_partido`):**
    *   La función recorre la tabla `sectores_estadio`.
    *   Realiza un `INSERT` masivo en `partido_sectores`, "sembrando" el stock inicial basado en la capacidad total del sector.
4.  **Disponibilidad Inmediata:** Al finalizar la transacción, el partido ya cuenta con su inventario de entradas listo para ser consumido por la API de NestJS.

---

## 🚦 Endpoints de la API

El backend corre en `http://localhost:3000` (desarrollo). Todas las peticiones deben incluir `Content-Type: application/json`.

#### Partidos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/partidos` | Lista todos los partidos |
| GET | `/partidos/:id` | Detalle de un partido |
| POST | `/partidos` | Crea un partido (body: `CrearPartidoDto`) |

#### Sectores
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/sectores` | Lista todos los sectores |
| GET | `/sectores/:id` | Detalle de un sector |
| POST | `/sectores` | Crea un sector (body: `CrearSectorDto`) |

#### Entradas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/entradas` | Lista todas las entradas |
| POST | `/entradas` | Reserva una entrada, bloquea 15 min (body: `CrearEntradaDto`) |

---

## 🧠 Reglas de Negocio Críticas

1. **La Regla de los 15 Minutos:** Al crear una entrada, el backend guarda `reservationExpiresAt = now + 15min`. Pasado ese tiempo, la entrada se cancela y el lugar se libera.
2. **Validación de Pasaporte:** No se emite ninguna entrada si el usuario no tiene un pasaporte registrado y válido en la tabla `usuarios`.
3. **Un Ticket por Partido:** El servicio verifica que el usuario no tenga ya una entrada activa (`RESERVADO` o `PAGADO`) para el mismo partido antes de crear una nueva.

---

## 🤖 Protocolo Erwin (IA Tutor)

- **Método Socrático:** No dar código completo. Proporcionar pistas, teoría y fragmentos educativos.
- **Foco Backend:** Priorizar lógica de servicios, DTOs y seguridad en NestJS.
- **Contexto:** Si falta información, preguntar antes de asumir.
- **Visión Fullstack:** Explicar siempre cómo los endpoints serán consumidos desde el Frontend (Next.js/TypeScript) mediante DTOs e interfaces tipadas.

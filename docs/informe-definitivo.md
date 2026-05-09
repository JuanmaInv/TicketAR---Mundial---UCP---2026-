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
[ Controller ]   ← Enruta la petición al servicio correcto (Mozo)
     ↓
[ Service ]      ← Aplica la lógica de negocio (Cocinero)
     ↓
[ Interface ]    ← Contrato universal (IEntradasRepository)
     ↓
[ Repository ]   ← Implementación técnica (Supabase/Postgres)
```

### 1. DTOs (Data Transfer Objects)
Antes de escribir lógica, definimos DTOs (`.dto.ts`). Son clases de TypeScript que validan los datos que entran a la API (usando `class-validator`). 
- *Misión:* Actúan como un "escudo" de seguridad. Implementan el principio de **Zero Trust**: el servidor solo acepta los campos definidos (ej. `userId`, `partidoId`, `sectorId`) e ignora el resto (ej. `status`, `qrCode`).
- *Validación Estricta:* Se utiliza `@IsUUID('4')` para prevenir inyecciones y asegurar que los identificadores sigan el estándar de Supabase.
- *Configuración Global:* Se utiliza el `ValidationPipe` en `main.ts` with `whitelist: true` para limpiar automáticamente cualquier campo no deseado enviado por el cliente.

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

Para que el sistema se banque el tráfico del Mundial y no se nos rompa todo cuando querramos escalar, armamos una arquitectura bien profesional con NestJS. La idea es que cada parte del código haga una sola cosa y que sea fácil de probar.

### 1. Patrón Repositorio (Repository Pattern)
Es el puente entre el servicio y la base de datos.
- **Herramienta Universal (Contrato):** Usamos interfaces (`IEntradasRepository`) para que al servicio no le importe de dónde vienen los datos.
- **Inversión de Control:** El servicio recibe su repositorio por inyección de dependencias (`@Inject`). Esto permite que podamos cambiar de Supabase a una base de datos local en 5 minutos solo tocando el `TicketsModule`, sin romper el `TicketsService`.
- **Independencia:** Si cambiamos de DB, solo creamos una nueva implementación de la interfaz.

### 2. Patrón State (Estado Activo)
Manejamos el ciclo de vida del ticket con objetos inteligentes en lugar de simples strings.
- **Transiciones:** Cada estado (`Reservado`, `Pagado`, `Cancelado`) valida si el cambio es posible.
- **Inyección:** Usamos una **Factory Inyectable** para que los estados puedan usar el Logger del sistema.

### 3. Patrón Adapter (Mapeo de Datos)
Es fundamental para desacoplarnos de la estructura de la base de datos.
- **Mapeo:** El repositorio actúa como adaptador, transformando el `snake_case` de Supabase al `camelCase` de nuestro dominio.
- **Protección:** Evita que un cambio en la tabla de la DB rompa todo el sistema.

### 4. Patrón Strategy (Flexibilidad y Escalabilidad)
Este patrón es nuestra navaja suiza para manejar diferentes lógicas sin ensuciar el código principal. Lo aplicamos en dos áreas críticas:
- **Validación de Identidad:** Clases separadas para validar DNI o Pasaporte. Si el Mundial agrega un "ID de Fan", solo creamos una nueva estrategia.
- **Pasarela de Pagos:** Implementamos una `IPaymentStrategy` que nos permite alternar entre `Stripe`, `MercadoPago` o una `SimulatedStrategy` para testing. Esto asegura que el sistema de tickets no dependa de un proveedor de pagos específico.

### 5. Patrón Guard (Seguridad por Roles)
Utilizamos Guards de NestJS para centralizar la autorización.
- **Decorador @Roles:** Permite especificar qué niveles de acceso (ADMINISTRADOR, CLIENTE) requiere cada endpoint.
- **RolesGuard:** Interceptor que verifica el rol del usuario en la base de datos antes de permitir el acceso a la lógica de negocio.

### 6. Base Común (Common Patterns)
Para no repetir código y que todo el proyecto hable el mismo idioma, creamos una carpeta `src/common/patterns`. Ahí guardamos los moldes (`interfaces`) de estos patrones para que cualquier otro módulo los pueda usar de entrada.

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
| PATCH | `/partidos/:id` | Actualiza datos del partido (ADMIN) |
| DELETE | `/partidos/:id` | Elimina un partido (ADMIN) |

#### Usuarios y Privacidad
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/usuarios` | Lista todos los usuarios (ADMIN) |
| DELETE | `/usuarios/me` | Darse de baja (Eliminación en cascada) |

#### Estadísticas (ADMIN)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/estadisticas` | Reporte de ventas por sector e ingresos |

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

## 🔐 Seguridad y Roles

- **Sistema de Roles:** Implementación de `RolesGuard` basado en la columna `rol` (`ADMINISTRADOR`, `CLIENTE`).
- **Protección:** Acciones como `POST/PATCH/DELETE` en partidos y sectores requieren rol `ADMINISTRADOR` validado mediante el decorador `@Roles()`.

## 🛡️ Endpoints de Administración

- **Panel Administrativo:** Endpoints protegidos para gestionar el inventario, los precios de los sectores y la creación de eventos.
- **Estadísticas:** Acceso restringido para visualizar métricas de ocupación y facturación en tiempo real.

## ⚠️ Privacidad y Darse de Baja

- **Eliminación en Cascada:** Al ejecutar `DELETE /usuarios/me`, se borra el usuario y todos sus registros asociados (reservas, tickets).
- **Consistencia:** El proceso libera automáticamente el inventario bloqueado por el usuario para asegurar que otros puedan comprar.

---

## 🤖 Protocolo Erwin (Cultura de Equipo)

El proyecto TicketAR no solo se trata de código, sino de un proceso de aprendizaje continuo.
- **Método Socrático:** La IA actúa como un mentor que guía al desarrollador mediante analogías y preguntas, asegurando que la arquitectura se entienda antes de implementarse.
- **Foco en Patrones:** Priorizamos el "Por Qué" sobre el "Cómo". Si una lógica es compleja, se encapsula en un Patrón (State, Strategy, Adapter).
- **Abstracción sobre Implementación:** "Programar para interfaces, no para implementaciones". Esta es la regla de oro que permite que TicketAR sea un sistema profesional y escalable para el Mundial 2026.

---

## 📅 Hoja de Ruta: Próximas Implementaciones (Roadmap)

### 1. Sistema de Roles y Administración (En Proceso)
- [x] **DB:** Incorporación de la columna `rol` en la tabla `usuarios` (Mayúsculas: `ADMINISTRADOR`, `CLIENTE`).
- [x] **Security:** Implementación de `RolesGuard` y el decorador `@Roles()` para proteger acciones sensibles.
- [x] **Audit:** Trigger de respaldo de usuarios actualizado para incluir el rol.
- [ ] **Endpoints:** Completar gestión de partidos (`PATCH` / `DELETE`) y panel de estadísticas de ventas.

### 2. Cumplimiento de Privacidad y Gestión de Cuenta
- [ ] **Baja de Usuario:** Implementación de `DELETE /usuarios/me`. Al borrar un usuario, se deben anular sus registros de entradas para mantener la consistencia del inventario y cumplir con el "Derecho al Olvido".
- [ ] **Validación de Stock:** Asegurar que el decremento de asientos sea consistente en transacciones concurrentes.

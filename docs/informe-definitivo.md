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

### Roles de cada capa

| Archivo | Rol | Regla |
|---------|-----|-------|
| `.dto.ts` | Valida el JSON de entrada | Nunca tiene lógica de negocio |
| `.controller.ts` | Recibe HTTP y delega al servicio | Nunca accede a la DB directamente |
| `.service.ts` | Toda la lógica de negocio | Única capa que toca la DB |
| `.entity.ts` | Define la forma de los datos en DB | Refleja exactamente las columnas de Supabase |
| `.module.ts` | Agrupa y conecta las piezas | Se registra en `AppModule` |

---

## ✅ Flujo de Trabajo Backend: La Receta para Agregar un Módulo Nuevo

Seguir **estrictamente** este orden al crear cualquier funcionalidad nueva:

```
1. Módulo → 2. Entidad → 3. DTO → 4. Controlador → 5. Servicio → 6. Tests → 7. Base de Datos → 8. Build
```

---

### Paso 1 — Módulo (El Esqueleto)

**Comando:**
```bash
cd backend-nest
npx nest g module nombre-modulo
npx nest g controller nombre-modulo
npx nest g service nombre-modulo
```

**Qué hace:** Genera la carpeta `src/nombre-modulo/` con 3 archivos base y los conecta automáticamente al `AppModule`.

**Verificar:** Abrir `src/app.module.ts` y confirmar que el nuevo módulo aparece en `imports: []`.

---

### Paso 2 — Entidad (El Plano de la DB)

**Crear:** `src/nombre-modulo/entities/nombre.entity.ts`

**Qué es:** Una clase TypeScript plana que define los campos que tendrá la tabla en Supabase.

```typescript
// Ejemplo: partido.entity.ts
export class PartidoEntidad {
  id: string;           // UUID de Supabase
  equipoLocal: string;
  equipoVisitante: string;
  fechaPartido: Date;
  estado: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
```

**Por qué primero:** Sin saber qué guardar, no se puede diseñar el DTO del siguiente paso.

---

### Paso 3 — DTO (El Escudo Protector)

**Crear:** `src/nombre-modulo/dto/crear-nombre.dto.ts`

**Qué es:** Una clase con decoradores de `class-validator` que valida automáticamente los datos que llegan del frontend.

```typescript
// Ejemplo: crear-partido.dto.ts
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CrearPartidoDto {
  @IsString({ message: 'El equipo local debe ser texto' })
  @IsNotEmpty({ message: 'El equipo local es obligatorio' })
  equipoLocal: string;

  @IsDateString({}, { message: 'La fecha debe ser una fecha válida (ISO)' })
  @IsNotEmpty()
  fechaPartido: Date;
}
```

**Resultado:** Si el frontend envía datos incorrectos, el DTO rechaza automáticamente con un `400 Bad Request` antes de que llegue al servicio.

> ⚠️ **IMPORTANTE:** Para que el DTO valide, el `main.ts` debe tener habilitado el `ValidationPipe`:
> ```typescript
> app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
> ```

---

### Paso 4 — Controlador (El Mesero)

**Editar:** `src/nombre-modulo/nombre-modulo.controller.ts`

**Regla de oro:** El controlador **no tiene lógica de negocio**. Solo recibe, delega y responde.

```typescript
@Controller('partidos')          // ← Define la ruta base: /partidos
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Get()                         // GET /partidos
  obtenerTodos() {
    return this.partidosService.obtenerTodos();
  }

  @Post()                        // POST /partidos
  crear(@Body() dto: CrearPartidoDto) {
    return this.partidosService.crear(dto);   // ← Delega al servicio
  }
}
```

> 💡 **Nota sobre idiomas:** Las rutas del `@Controller()` están en **español** para consistencia con el proyecto (`'partidos'`, `'sectores'`, `'entradas'`, etc.).

---

### Paso 5 — Servicio y CRUD (El Chef)

**Editar:** `src/nombre-modulo/nombre-modulo.service.ts`

**Fase 1 — Mock-Driven Development:** Usar un array en memoria para desarrollar sin depender de Supabase.

```typescript
@Injectable()
export class PartidosService {
  // Datos de semilla para desarrollo (se reemplaza con Supabase en el Paso 7)
  private baseDeDatosSimulada: PartidoEntidad[] = [
    {
      id: 'uuid-ejemplo-001',
      equipoLocal: 'Argentina',
      equipoVisitante: 'Brasil',
      fechaPartido: new Date('2026-06-15T18:00:00Z'),
      nombreEstadio: 'MetLife Stadium',
      estado: 'PROGRAMADO',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    },
  ];

  obtenerTodos(): PartidoEntidad[] {
    return this.baseDeDatosSimulada;
  }

  crear(dto: CrearPartidoDto): PartidoEntidad {
    const nuevo: PartidoEntidad = {
      id: crypto.randomUUID(),
      ...dto,
      estado: 'PROGRAMADO',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };
    this.baseDeDatosSimulada.push(nuevo);
    return nuevo;
  }
}
```

> ⚠️ **Limitación del mock:** Los datos se pierden cada vez que el servidor reinicia. Esto es intencional en esta fase.

---

### Paso 6 — Tests (Los Specs)

Nest CLI genera automáticamente archivos `.spec.ts` al crear módulos. Hay que **completarlos** correctamente.

#### Error frecuente: dependencias faltantes en el módulo de testing

```typescript
// ❌ INCORRECTO — NestJS no puede inyectar el servicio al controlador
const module = await Test.createTestingModule({
  controllers: [PartidosController],
}).compile();

// ✅ CORRECTO — El servicio se provee para que NestJS pueda inyectarlo
const module = await Test.createTestingModule({
  controllers: [PartidosController],
  providers: [PartidosService],    // ← SIEMPRE incluir los providers del controlador
}).compile();
```

**Regla:** Si el controlador tiene `constructor(private service: AlgunServicio)`, ese servicio **debe estar en `providers`** del módulo de testing.

#### Correr los tests

```bash
pnpm run test           # Corre todos los specs una vez
pnpm run test:watch     # Modo watch (re-corre al guardar)
pnpm run test:cov       # Con reporte de cobertura
```

**Resultado esperado:** Todos los suites en `PASS`. Si hay `FAIL`, revisar el error antes de avanzar al siguiente paso.

---

### Paso 7 — Base de Datos (La Bóveda — Supabase)

**Estado actual del proyecto:** ✅ Infraestructura lista — pendiente conectar cada servicio.

#### Arquitectura de la integración

Se implementó un patrón de **Singleton centralizado** para el cliente de Supabase. En vez de crear el cliente en cada servicio, existe un módulo compartido en `/common` que lo provee a toda la aplicación:

```
src/common/
├── enums/
│   └── sector-type.enum.ts     ← Única fuente de verdad de sectores
└── supabase/
    ├── supabase.service.ts      ← Crea y expone el cliente de Supabase
    └── supabase.module.ts       ← Distribuye el servicio globalmente
```

#### `supabase.service.ts` — El cliente único

```typescript
@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    // getOrThrow lanza excepción si la variable no existe en .env
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const key = this.configService.getOrThrow<string>('SUPABASE_KEY');
    this.client = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
```

> **¿Por qué `private readonly configService`?** El modificador `private` limita el acceso a la clase. El `readonly` garantiza que la referencia no se reasigne después del constructor. El shorthand de TypeScript declara y asigna la propiedad en una sola línea.

#### `supabase.module.ts` — Distribución global

```typescript
@Global()   // ← Hace que SupabaseService esté disponible sin importar este módulo
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],   // ← Otros módulos pueden inyectarlo
})
export class SupabaseModule {}
```

#### `app.module.ts` — Registro en el root

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // Carga el .env
    SupabaseModule,                            // Distribuye el cliente
    UsuariosModule,
    // ... resto de módulos
  ],
})
export class AppModule {}
```

#### Cómo usar el cliente en cualquier servicio (próximo paso)

```typescript
// En cualquier servicio, inyectar SupabaseService:
@Injectable()
export class PartidosService {
  constructor(private readonly supabase: SupabaseService) {}

  async obtenerTodos() {
    const { data, error } = await this.supabase.getClient()
      .from('partidos')   // ← nombre exacto de la tabla en Supabase
      .select('*');
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
```

**Variables de entorno requeridas** (ver `.env.example`):
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGci...   # service_role key (NUNCA en el frontend)
```

> ⚠️ **Seguridad crítica:** En el backend se usa la `service_role` key porque el servidor nunca es visible al usuario. La `anon` key es para el cliente de Next.js en el frontend.

> 💡 **Ventaja arquitectónica:** Solo el Servicio cambia al conectar la DB. Los Controladores, DTOs y Módulos no se tocan.

---

### Paso 8 — Build (La Prueba de Fuego)

**Antes de todo PR, ejecutar:**

```bash
pnpm run build
```

- Sin output de error → ✅ TypeScript limpio, listo para mergear.
- Con errores `TS2345`, `TS2322`, etc. → ❌ Corregir antes de hacer push.

**Por qué es obligatorio:** El compilador detecta errores de tipos que el editor puede ignorar. Si el build no pasa, la CI lo rechazará.

---

## 🧩 Módulos Implementados — Estado Actual

| Módulo | Carpeta | Ruta HTTP | Estado |
|--------|---------|-----------|--------|
| Usuarios | `src/usuarios/` | `/usuarios` | ✅ Mock |
| Partidos | `src/matches/` | `/partidos` | ✅ Mock |
| Sectores | `src/stadium-sectors/` | `/sectores` | ✅ Mock |
| Entradas | `src/tickets/` | `/entradas` | ✅ Mock |
| Pagos | `src/payments/` | `/pagos` | 🔲 Esqueleto |
| Credenciales Pasaporte | `src/passport-credentials/` | `/credenciales-pasaporte` | ✅ Mock |

**Infraestructura compartida (`/common`):**

| Recurso | Archivo | Estado |
|---------|---------|--------|
| Enum de sectores | `common/enums/sector-type.enum.ts` | ✅ |
| Cliente de Supabase | `common/supabase/supabase.service.ts` | ✅ |
| Módulo global DB | `common/supabase/supabase.module.ts` | ✅ |
| Carga de variables de entorno | `ConfigModule` en `app.module.ts` | ✅ |

---

## 📋 Diccionario de Datos (Contrato con el Frontend)

### Módulo Usuarios (`/usuarios`)
- **Entidad `UsuarioEntidad`** (`usuario.entity.ts`):
  - `id`: string (UUID de Supabase)
  - `email`: string
  - `nombre`: string
  - `apellido`: string
  - `numeroPasaporte`: string
  - `rol`: `'USUARIO'` | `'ADMIN'` | `'PRENSA'`
- **DTO `CrearUsuarioDto`** (`crear-usuario.dto.ts`): Requeridos `email`, `nombre`, `apellido`, `numeroPasaporte`.

### Módulo Partidos (`/partidos`)
- **Entidad `PartidoEntidad`** (`match.entity.ts`):
  - `id`: string (UUID de Supabase)
  - `equipoLocal`: string
  - `equipoVisitante`: string
  - `fechaPartido`: Date (ISO string)
  - `nombreEstadio`: string
  - `estado`: `'PROGRAMADO'` | `'EN_CURSO'` | `'FINALIZADO'` | `'CANCELADO'`
  - `fechaCreacion`: Date
  - `fechaActualizacion`: Date
- **DTO `CrearPartidoDto`** (`create-match.dto.ts`): Requeridos `equipoLocal`, `equipoVisitante`, `fechaPartido`, `nombreEstadio`.

### Módulo Sectores (`/sectores`)
- **Entidad `StadiumSectorEntity`** (`stadium-sector.entity.ts`):
  - `id`: string
  - `name`: string (`'PLATEA'` | `'PALCO'` | `'POPULAR'` | `'PRENSA'`)
  - `capacity`: number
  - `availableSeats`: number
  - `price`: number (en ARS)
  - `createdAt`: Date
  - `updatedAt`: Date
- **DTO `CrearSectorDto`** (`create-stadium-sector.dto.ts`): Requeridos `nombre`, `capacidad`, `precio`.

### Módulo Entradas (`/entradas`)
- **Entidad `TicketEntity`** (`ticket.entity.ts`):
  - `id`: string (UUID de Supabase)
  - `userId`: string (relación con Usuario)
  - `sectorId`: string (relación con Sector)
  - `status`: `TicketStatus` → `'RESERVADO'` | `'PAGADO'` | `'CANCELADO'`
  - `reservationExpiresAt?`: Date (bloqueo 15 min)
  - `qrCode?`: string (solo cuando status = `'PAGADO'`)
  - `createdAt`: Date
  - `updatedAt`: Date
- **DTO `CrearEntradaDto`** (`create-ticket.dto.ts`): Requeridos `idUsuario`, `idSector`.

### Módulo Pagos (`/pagos`) — ⏳ Pendiente
- **Módulo `PagosModule`** declarado y listo.
- Entidad y DTO pendientes de implementación.
- Campos esperados: `idEntrada`, `monto`, `moneda` (`'ARS'`), `estado` (`'PENDIENTE'`|`'COMPLETADO'`|`'FALLIDO'`), `pasarela` (`'MERCADOPAGO'`|`'STRIPE'`).

### Módulo Credenciales de Pasaporte (`/credenciales-pasaporte`)
- **Entidad `CredencialPasaporteEntidad`** (`passport-credential.entity.ts`):
  - `id`: string (UUID de Supabase)
  - `idUsuario`: string
  - `numerodocumento`: string (requisito crítico)
  - `codigoPais`: string (`'AR'`, `'USA'`, `'BRA'`, etc.)
  - `estaValidado`: boolean (debe ser `true` para emitir entradas)
  - `fechaCreacion`: Date
  - `fechaActualizacion`: Date
- **DTO `ValidarPasaporteDto`** (`validate-passport.dto.ts`): Requeridos `idUsuario`, `numerodocumento`, `codigoPais` (2-3 caracteres).

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

#### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/usuarios` | Lista todos los usuarios |
| POST | `/usuarios` | Registra un usuario (body: `CrearUsuarioDto`) |

#### Credenciales de Pasaporte
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/credenciales-pasaporte` | Valida pasaporte (body: `ValidarPasaporteDto`) |

---

## 🛡️ Autenticación y Seguridad

Utilizamos **Supabase Auth**. Flujo para el frontend:

1. El usuario se loguea mediante el Supabase Client en el frontend.
2. El frontend obtiene el `access_token` (JWT).
3. **Obligatorio:** Cada petición al backend (excepto `GET /partidos`) debe incluir:
   ```
   Authorization: Bearer <JWT_TOKEN>
   ```

---

## ⚠️ Manejo de Errores (Error Contract)

El backend responde con esta estructura estándar en caso de fallo:

```json
{
  "statusCode": 400,
  "message": ["El nombre es obligatorio", "El correo no es válido"],
  "error": "Bad Request",
  "timestamp": "2026-04-20T12:00:00Z",
  "path": "/usuarios"
}
```

---

## 🧠 Reglas de Negocio Críticas

1. **La Regla de los 15 Minutos:** Al crear una entrada, el backend guarda `reservationExpiresAt = now + 15min`. El frontend debe mostrar una cuenta regresiva. Pasado ese tiempo, la entrada pasa a `CANCELADO` y el lugar se libera.
2. **Validación de Pasaporte:** No se emite ninguna entrada si el `estaValidado` de la credencial del usuario es `false`.
3. **Un Ticket por Partido:** El servicio verifica que el usuario no tenga ya una entrada activa (`RESERVADO` o `PAGADO`) para el mismo partido antes de crear una nueva.

---

## 🛠️ Enums Compartidos (Single Source of Truth)

Ubicación: `backend-nest/src/common/enums/`

El frontend **debe** usar estos valores exactos:

- **`TipoSector`** (`sector-type.enum.ts`):
  - `POPULAR` — Acceso general.
  - `PLATEA` — Asientos numerados.
  - `PALCO` — Zona preferencial.
  - `PRENSA` — Periodistas acreditados.

- **`TicketStatus`** (`ticket-status.enum.ts`):
  - `RESERVADO` — Bloqueado por el servidor (15 min).
  - `PAGADO` — Pago confirmado, QR generado.
  - `CANCELADO` — Reserva expirada o pago rechazado.

---

## 🤖 Protocolo Erwin (IA Tutor)

- **Método Socrático:** No dar código completo. Proporcionar pistas, teoría y fragmentos educativos.
- **Foco Backend:** Priorizar lógica de servicios, DTOs y seguridad en NestJS.
- **Contexto:** Si falta información, preguntar antes de asumir.
- **Visión Fullstack:** Explicar siempre cómo los endpoints serán consumidos desde el Frontend (Next.js/TypeScript) mediante DTOs e interfaces tipadas.

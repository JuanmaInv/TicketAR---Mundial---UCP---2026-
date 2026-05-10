# 📑 Guía Maestra: Arquitectura y Migración de Datos - TicketAR

Este documento define el estándar de ingeniería para el proyecto TicketAR. Sirve como guía completa para que cualquier desarrollador pueda entender la arquitectura, extender el sistema y mantener la integridad del backend del Mundial 2026.

---

## 🎯 Visión y Lógica de Negocio
Desarrollar una plataforma de venta de entradas enfocada en la seguridad y eliminación de la reventa ilegal.
- **Validación:** Entrada obligatoria con Pasaporte del titular.
- **Regla Crítica:** Máximo 6 entradas por cuenta de usuario (Global Cap). El titular presenta su pasaporte para validar el grupo.
- **Reserva:** El servidor bloquea el lugar por 15 minutos hasta confirmar el pago.
- **Sectores:** Control de capacidad estricto por PLATEA, PALCO, POPULAR y PRENSA.
- **Entregable:** Generación de código QR único por entrada enviado por correo tras el pago.
- **Reventa:** Sistema oficial integrado en la plataforma con comisión controlada.

---

## 🛠️ Stack Tecnológico (Monorepo)
| Rol | Tecnología | Carpeta |
| :--- | :--- | :--- |
| **Backend** | NestJS (Modular) | `/backend-nest` |
| **Frontend** | Next.js + Tailwind | `/frontend-client` |
| **Database/Auth**| Supabase | — |
| **Pagos** | Stripe (Int) / Mercado Pago (Local) | — |
| **Testing** | Playwright (E2E y Estrés) | — |
| **Métricas** | Grafana | — |

---

## 🌐 Arquitectura de Integración (Fullstack)
Dividimos la responsabilidad en tres pilares fundamentales para garantizar la seguridad:
1.  **Base de Datos (Supabase):** Corazón del sistema. Gestiona la persistencia real.
2.  **Backend (NestJS):** El guardián y cerebro. Posee la "llave maestra" (`service_role`) para operaciones críticas y validación de reglas de negocio.
3.  **Frontend (Next.js):** La cara del proyecto. Captura la intención del usuario y se comunica con el Backend mediante REST.

---

## 🏗️ La Arquitectura (El Inicio)
*Esta fase define el **"Qué"** y el **"Dónde"**. Decidimos cómo se organiza el código y cómo se estructuran los datos antes de escribir lógica pesada.*

### 1. Filosofía de Diseño: Del Código a la Realidad
Usamos el enfoque **Code-First**: diseñamos las entidades en TypeScript para que el compilador nos proteja antes de tocar la base de datos.
- **Las Entidades (`.entity.ts`) → El Plano:** Es el esquema técnico de la tabla.
- **Razón Arquitectónica:** Garantiza que el contrato de datos sea único. Si falta un campo en la entidad, el sistema fallará en compilación, no en producción.

### 2. Ciclo de Vida: Modularización y Entidades
1.  **Modularización (`.module.ts`):** Creamos la caja independiente para cada funcionalidad (Users, Matches, etc.).
2.  **Entidad (`.entity.ts`):** Definimos el plano de datos esencial para el Mundial.

### 3. Implementación de Base de Datos (Paso a Paso)
1.  **Diseño en NestJS:** Definimos campos (Pasaporte, Estadio, etc.).
2.  **Traducción a SQL:** Convertimos camelCase a snake_case para Postgres.
3.  **Ejecución en Supabase:** Levantamos las tablas físicas.
4.  **Automatización (Triggers):** Delegamos la integridad crítica al motor de la DB.

### 4. Analogía de Piezas y Responsabilidades
| Pieza en NestJS | Aporte a la Base de Datos | Analogía |
| :--- | :--- | :--- |
| **Entidad** | Define columnas y tipos. | **La Receta** |
| **DTO** | Filtra y valida la entrada. | **El Tamiz** |
| **Servicio** | Ejecuta la lógica. | **El Cocinero** |
| **Repositorio** | Habla con la DB. | **La Despensa** |
| **Trigger** | Acción automática en DB. | **El Robot de cocina** |

---

## 🧠 La Ingeniería (El Núcleo)
*Aquí reside el **"Músculo"**. Incluye los servicios y patrones que permiten que la aplicación sea robusta ante fallos.*

### 1. El Servicio (`.service.ts`): El Cerebro
Concentramos toda la lógica aquí para evitar "controladores gordos".
- **Razón Arquitectónica:** Permite reutilizar lógica y facilita los tests unitarios.

### 2. Patrones de Diseño Aplicados
- **State Pattern:** Gestiona estados del ticket (`RESERVADO` → `PAGADO`).
- **Strategy Pattern:** Intercambia pasarelas de pago (Stripe/MP) sin cambiar el código central.
- **Adapter Pattern:** Mapea el formato de la DB al formato de la aplicación.
- **Repository Pattern:** Desacopla la lógica de negocio de la tecnología de base de datos.

### 3. Lógica de Negocio y Reglas Críticas
1.  **Regla de los 15 Minutos:** El servidor libera automáticamente asientos reservados que no fueron pagados.
2.  **Validación de Pasaporte:** Cruce obligatorio con la DB de identidades autorizadas.
3.  **Capacidad Global:** Un usuario no puede poseer más de 6 entradas en total para el torneo.

### 4. Inventario Dinámico: El "Molde" y la "Galletita"
Para gestionar el stock de millones de entradas sin errores:
1.  **`sectores_estadio` (El Molde):** Capacidad física teórica.
2.  **`partidos` (La Orden):** Cada encuentro dispara la creación de su propio inventario.
3.  **`partido_sectores` (La Galletita Real):** Copia independiente del molde para un partido específico.

### 5. Scripts SQL de Ingeniería
```sql
-- Gestión de Stock en Tiempo Real
ALTER TABLE partido_sectores ADD CONSTRAINT chk_stock_positivo CHECK (asientos_disponibles >= 0);

CREATE OR REPLACE FUNCTION funcion_restar_stock_entrada()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE partido_sectores
    SET asientos_disponibles = asientos_disponibles - 1
    WHERE id_partido = NEW.id_partido AND id_sector = NEW.id_sector;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_restar_stock AFTER INSERT ON entradas FOR EACH ROW EXECUTE FUNCTION funcion_restar_stock_entrada();
```

---

## 🚀 La Comunicación (El Cierre)
*Fase de exposición al mundo exterior y blindaje de acceso.*

### 1. Controladores y DTOs
Actúan como la "Ventanilla de Atención" y el "Filtro de Seguridad".
- **Razón Arquitectónica:** El DTO asegura que nadie inyecte campos maliciosos en la base de datos.

### 2. Seguridad y Roles (RBAC)
- **ADMINISTRADOR:** Gestión total de partidos, sectores y auditoría.
- **CLIENTE:** Compra, reserva y visualización de sus propias entradas.
- **Eliminación en Cascada:** Al borrar un usuario, se limpian sus registros vinculados (Derecho al Olvido).

### 3. Catálogo Completo de Endpoints (API)
| Módulo | Método | Ruta | Descripción | Rol |
| :--- | :--- | :--- | :--- | :--- |
| **Partidos** | GET | `/partidos` | Lista de encuentros | Público |
| **Partidos** | POST | `/partidos` | Crea evento | **ADMIN** |
| **Usuarios** | DELETE | `/usuarios/me` | Baja definitiva | Dueño |
| **Entradas** | POST | `/entradas` | Reserva (15 min) | CLIENTE |
| **Entradas** | GET | `/entradas/:id/qr` | Obtiene QR | Dueño |
| **Pagos** | POST | `/payments/webhook` | Recibe confirmación | Sistema |
| **Estadísticas**| GET | `/estadisticas` | Reporte de ventas | **ADMIN** |

---

## 🚀 Inicio Rápido (Para Desarrolladores)
1.  **Instalar:** `cd backend-nest && pnpm install`
2.  **Configurar:** `cp .env.example .env` (Cargar llaves de Supabase).
3.  **Levantar:** `pnpm run start:dev`
4.  **Tests:** `pnpm run test` (Asegurar **6 passed, 0 failed**).
5.  **Build:** `pnpm run build` (Verificar cero errores de TS).

---

## 🌿 Flujo de Git y Colaboración
1.  **Branching:** `feat/`, `fix/`, `chore/`.
2.  **Commits:** Seguir estándar semántico.
3.  **Sync:** Rebase con `main` diariamente.
4.  **Docs-as-Code:** Toda regla nueva debe reflejarse en `/docs`.

---

## 🤖 Protocolo Erwin (Cultura de Equipo)
- **Método Socrático:** Entender la arquitectura antes de tirar código.
- **Abstracción:** Programar para interfaces, no para implementaciones.
- **Foco en el "Por Qué":** Cada línea de código tiene una justificación técnica.

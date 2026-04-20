# Informe Definitivo: TicketAR - Mundial 2026

## 🎯 Visión y Lógica de Negocio
Desarrollar una plataforma de venta de entradas enfocada en la seguridad y eliminación de la reventa ilegal.
- **Validación:** Entrada obligatoria con Pasaporte.
- **Regla Crítica:** Máximo 1 entrada por sesión por usuario.
- **Reserva:** El servidor bloquea el lugar por tiempo limitado (ej. 15 min) hasta confirmar pago.
- **Sectores:** Control de capacidad estricto por PLATEA, PALCO, POPULAR y PRENSA.
- **Entregable:** Generación de código QR enviado por correo tras confirmar el pago.
- **Reventa:** Sistema oficial integrado en la plataforma con comisión.

## 🛠️ Stack Tecnológico (Monorepo)
- **Backend:** NestJS (Modular) en `/backend-nest`.
- **Frontend:** Next.js + Tailwind en `/frontend-client`.
- **Database/Auth:** Supabase (No usar Clerk).
- **Pagos:** Stripe (Int) / Mercado Pago (Local). No almacenar datos de tarjetas.
- **Testing:** Playwright (E2E y estrés).
- **Métricas:** Graphana para medir el compromiso del equipo.

## 📂 Gestión de Dependencias y Entorno (Estricto)
- **Instalación:** Ejecutar `npm install` solo en la carpeta del rol correspondiente.
- **Seguridad:** `.env` está en `.gitignore`. NUNCA subir llaves privadas.
- **Plantilla:** Usar `.env.example` para que el equipo sepa qué variables configurar.

## ⚙️ CI/CD y Workflows de Integración
- **Integración Continua:** Automatización mediante GitHub Actions. Existe `backend-ci.yml` para validar NestJS y se añadirá próximamente `frontend-ci.yml` para React/Next.js.
- **Triggers:** Se utiliza el wildcard `feat/**` para que las pruebas corran automáticamente en todas las ramas de nuevas funcionalidades tras cada Push o PR.

## 🌿 Flujo de Git y Colaboración (Branch-per-Feature)
1. **Adopción > Funcionalidad:** Usar herramientas simples que el equipo use a diario.
2. **Branching:** Ramas dedicadas por funcionalidad (ej. `feat/ticket-reservation`, `feat/auth-passport`, `fix/`, `chore/`). El frontend debe seguir el mismo patrón.
3. **Protección:** Gatear `main` mediante Pull Requests (PR) y revisión de código. Prohibido hacer merge directo a main.
4. **Issues:** Una tarea = Una Issue en GitHub. Evitar subtareas confusas; usar "Relationships".
5. **Sync:** Sincronizar (Rebase/Sync) con `main` diariamente para evitar conflictos.
6. **Commits Semánticos:** Seguir el estándar definido en el proyecto.
7. **Documentación:** Preferir metodologías *Docs-as-Code* (guardar en `/docs`) para que las reglas de negocio viajen con la versión de código correspondiente.

## 🏗️ Arquitectura y Flujo de Desarrollo Backend (NestJS)
El backend de TicketAR utiliza una **Arquitectura por Capas** estructurada en módulos. Esto garantiza que el código sea escalable, fácil de probar y de mantener. El desarrollo de cada nueva funcionalidad sigue estrictamente el siguiente flujo:

### 1. Modularización (Modules)
Cada funcionalidad importante (Auth, Tickets, Usuarios) tiene su propio módulo (`.module.ts`). Es el "organizador" que agrupa los Controladores y Servicios relacionados, manteniendo el código desacoplado.

### 2. DTOs (Data Transfer Objects)
Antes de escribir lógica, definimos DTOs (`.dto.ts`). Son clases de TypeScript que validan los datos que entran a la API (usando `class-validator`). 
- *Misión:* Actúan como un "escudo" de seguridad. Si el frontend envía datos incorrectos, el DTO rechaza la petición con un error 400 antes de que llegue a nuestra lógica.
- *Beneficio:* Permiten que el equipo de Frontend sepa exactamente qué formato de JSON deben enviar.

### 3. Controladores (Controllers)
Los controladores (`.controller.ts`) reciben las peticiones HTTP (GET, POST, PUT, DELETE) desde internet.
- *Regla de Oro:* **No tienen lógica de negocio**. Solo reciben la petición (ya validada por el DTO), llaman al Servicio correspondiente, y devuelven la respuesta HTTP.

### 4. Servicios (Services)
Los servicios (`.service.ts`) son el "cerebro" puro de la aplicación.
- *Misión:* Aquí vive toda la regla de negocio (ej. verificar si el usuario ya tiene una entrada, calcular el tiempo de reserva temporal de 15 minutos, aplicar comisiones de reventa).

### 5. Entidades y Acceso a Datos (Entities/CRUD)
Las entidades representan cómo se ven las tablas de nuestra base de datos (Supabase) dentro del código.
- *Misión:* El Servicio interactúa con la base de datos a través de repositorios/ORMs para hacer el CRUD (Create, Read, Update, Delete) de los registros.

### 🔄 Resumen del Flujo de una Petición (Ej. Reserva de Entrada)
1. El **Frontend (React)** hace una petición HTTP POST a `/tickets/reserve`.
2. El **DTO** intercepta y valida que los datos sean correctos (ej. ID de usuario válido).
3. El **Controlador** recibe los datos validados y los pasa al **Servicio**.
4. El **Servicio** aplica la lógica de negocio (bloqueo temporal de 15 min).
5. El **Servicio** se comunica con la **Base de Datos** para crear el registro en estado `reserved`.
6. El **Servicio** devuelve el éxito al **Controlador**, y este responde al **Frontend** con los datos tipados.

### ✅ Flujo de Trabajo Backend: De Cero a Producción (La Receta)
Para mantener una arquitectura limpia y predecible, cada nueva funcionalidad (ej. `payments`, `users`, `stadium-sectors`) debe seguir **estrictamente** este ciclo de desarrollo mental y técnico: `Modularización -> Entidades -> DTOs -> CRUD -> Build`.

**1. Modularización (El Esqueleto)**
   - Usar el Nest CLI para generar la tríada básica: Módulo, Controlador y Servicio (`nest g module nombre`, `nest g controller nombre`, `nest g service nombre`).
   - *Objetivo:* Dejar preparadas las columnas del código antes de escribir la lógica.

**2. Entidades (La Base de Datos)**
   - Definir cómo se estructuran los datos en la base de datos (Supabase) mediante Types, Interfaces o el esquema del ORM.
   - *Objetivo:* Saber qué columnas e información va a persistir nuestro sistema antes de decidir qué le vamos a pedir al usuario.

**3. DTOs (El Escudo Protector)**
   - Crear el directorio `dto/` y definir el archivo (ej. `create-nombre.dto.ts`). Usar `class-validator` (`@IsString()`, `@IsEnum()`).
   - Acoplar el DTO en el Controlador (`@Body() data: CreateNombreDto`).
   - *Objetivo:* Garantizar que ninguna petición con datos basura alcance nuestra lógica de negocio. Regla estricta: ¡Prohibido usar `any`!

**4. CRUD y Delegación (El Cerebro de la App)**
   - **Delegar:** Inyectar el Servicio en el Controlador y pasarle el DTO validado (`return this.miService.create(data);`).
   - **Hacer el CRUD:** Ir al `.service.ts` y escribir los métodos para Crear, Leer, Actualizar o Borrar (Create, Read, Update, Delete) comunicándose directamente con la base de datos de Supabase e implementando la lógica de negocio.
   - *💡 Ventaja Arquitectónica (Aislamiento de la Base de Datos):* Al delegar el CRUD exclusivamente al Servicio, logramos que ni el Controlador, ni el DTO, ni el Frontend sepan qué base de datos usamos. Si el día de mañana migramos de Supabase a MongoDB o Firebase, **solo se modifica el código interno del Servicio**. El resto de la aplicación permanece intacto. [PUNTO DE INSERCIÓN FUTURO: Integración real con Supabase SDK].

**5. Build (La Prueba de Fuego)**
   - Ejecutar el comando de compilación (`pnpm run build` o `npm run build`) en la consola local antes de hacer un commit/push.
   - *Objetivo:* Verificar que todo el TypeScript compila correctamente y que no existan errores de tipos cruzados entre Controladores, DTOs y Servicios. Si el build pasa, el código es seguro para el entorno de Integración Continua (CI).


## 🤖 Protocolo Erwin (IA Tutor)
- **Método Socrático:** No dar código completo. Proporcionar pistas, teoría y fragmentos educativos.
- **Foco Backend:** Erwin es Backend Engineer. Priorizar lógica de servicios, DTOs y seguridad en NestJS.
- **Contexto:** Si falta información, preguntar antes de asumir.
- **Visión Fullstack y API (Nuevo):** Erwin debe explicar siempre cómo los controladores y endpoints de NestJS serán consumidos posteriormente desde el Frontend (React/Next.js con TypeScript) mediante DTOs e interfaces, asegurando que el backend exponga datos limpios y tipados.

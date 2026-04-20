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
Para mantener una arquitectura limpia y predecible, cada nueva funcionalidad (ej. `payments`, `users`, `stadium-sectors`) debe seguir **estrictamente** este ciclo de desarrollo mental y técnico en el siguiente orden:
`Módulo -> Entidad -> DTO -> Controlador -> Servicio (CRUD) -> Base de Datos -> Build`.

**1. Módulo (El Esqueleto)**
   - **Acción:** Usar el Nest CLI para generar la tríada básica del módulo (`nest g module nombre`, `nest g controller nombre`, `nest g service nombre`).
   - **Detalle:** En NestJS, el Módulo agrupa las funcionalidades lógicamente. Aquí se declaran los controladores y se proveen los servicios. Es el punto de entrada que luego se conecta al `AppModule`.
   - **Objetivo:** Dejar preparadas las carpetas, archivos base y las conexiones (imports/providers) antes de escribir la lógica, asegurando que el nuevo bloque esté integrado y aislado del resto de la aplicación.

**2. Entidad (El Plano de la Base de Datos)**
   - **Acción:** Crear un archivo `.entity.ts` definiendo las propiedades (columnas) y tipos de datos.
   - **Detalle:** Representa cómo se guardará la información en la base de datos (Supabase). Establece el modelo de dominio central para la funcionalidad (ej. qué campos exactos tiene un Usuario o un Sector).
   - **Objetivo:** Tener un "plano" claro de qué información va a persistir nuestro sistema. Sin saber qué vamos a guardar, es imposible saber qué información exigirle al usuario en el siguiente paso.

**3. DTO (Data Transfer Object - El Escudo Protector)**
   - **Acción:** Crear clases con decoradores de `class-validator` (ej. `@IsString()`, `@IsNotEmpty()`, `@IsEnum()`).
   - **Detalle:** Define el contrato estricto de entrada y salida de nuestra API. Verifica automáticamente que los datos enviados por el frontend (React) tengan el formato exacto antes de que toquen nuestro código.
   - **Objetivo:** Garantizar que ninguna petición con datos basura o malintencionados cruce nuestra frontera. Actúa como la primera línea de defensa para proteger la integridad del backend.

**4. Controlador (El Mesero)**
   - **Acción:** Configurar rutas (ej. `@Get()`, `@Post()`), importar el DTO (`@Body() data: MiDto`) e inyectar el Servicio en el constructor.
   - **Detalle:** Su única responsabilidad es escuchar las peticiones HTTP, recibir los datos ya validados por el DTO y delegar el trabajo pesado al Servicio. No debe tener lógica de negocio (nada de validaciones complejas o "ifs" de negocio).
   - **Objetivo:** Actuar como enrutador eficiente. Recibe el pedido limpio, se lo pasa al "Chef" (el Servicio) y, cuando este termina, le devuelve la respuesta formateada al cliente.

**5. Servicio y CRUD (El Chef)**
   - **Acción:** Implementar los métodos de negocio (Create, Read, Update, Delete).
   - **Detalle:** Aquí residen las reglas de negocio, los cálculos lógicos y la interacción con los datos. Es el cerebro de la aplicación.
   - **Objetivo:** Procesar los datos. Inicialmente (usando *Mock-Driven Development*), guardamos en un array en memoria temporal para avanzar rápidamente en la lógica del negocio sin depender de servicios externos caídos o configuraciones complejas.

**6. Base de Datos (La Bóveda)**
   - **Acción:** Reemplazar las operaciones del array temporal en el Servicio por consultas reales (queries) a Supabase.
   - **Detalle:** Este es el paso final de desarrollo donde conectamos nuestra aplicación a la persistencia real. Manejamos promesas, errores de base de datos y transacciones.
   - **Objetivo:** Guardar los datos de forma permanente.
   - **💡 Ventaja Arquitectónica Clave:** Al dejar esto para el final y aislar la lógica de DB exclusivamente dentro del Servicio, logramos que la base de datos sea un "detalle de implementación". Si el día de mañana migramos de Supabase a PostgreSQL clásico o MongoDB, **ni los Controladores, ni los DTOs, ni los Módulos se ven afectados**.

**7. Build (La Prueba de Fuego)**
   - **Acción:** Ejecutar el comando de compilación estricta (`pnpm run build` o equivalente).
   - **Detalle:** El compilador revisa todo el código en busca de inconsistencias de tipos de TypeScript o errores de sintaxis que pasaron desapercibidos durante el desarrollo.
   - **Objetivo:** Verificar que las interfaces, DTOs y Entidades se comuniquen perfectamente entre capas. Un "build" exitoso es nuestro sello de garantía de que el código es robusto y está listo para ser mergeado a la rama principal.


## 🤖 Protocolo Erwin (IA Tutor)
- **Método Socrático:** No dar código completo. Proporcionar pistas, teoría y fragmentos educativos.
- **Foco Backend:** Erwin es Backend Engineer. Priorizar lógica de servicios, DTOs y seguridad en NestJS.
- **Contexto:** Si falta información, preguntar antes de asumir.
- **Visión Fullstack y API (Nuevo):** Erwin debe explicar siempre cómo los controladores y endpoints de NestJS serán consumidos posteriormente desde el Frontend (React/Next.js con TypeScript) mediante DTOs e interfaces, asegurando que el backend exponga datos limpios y tipados.

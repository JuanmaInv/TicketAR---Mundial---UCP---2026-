# 📑 Guía Maestra: Arquitectura y Migración de Datos - TicketAR

Este documento explica la filosofía de diseño de nuestra base de datos y contiene los scripts necesarios para implementar el sistema de Roles, Inventario Dinámico y Auditoría.

---

## 🏗️ Filosofía de Diseño: Del Código a la Realidad

En TicketAR, la base de datos no se crea "sola", sino que la diseñamos siguiendo las piezas que ya tenemos en el Backend. Aquí te explico qué sacamos de cada lado:

### 1. Las Entidades (`.entity.ts`) → El Plano
La Entidad es el "esquema" o el dibujo de cómo queremos que sea la tabla en la vida real.
- **En el código:** Si en `usuario.entity.ts` pusiste `nombre: string`, eso nos dice que en la base de datos necesitamos una columna `nombre` de tipo `text`.
- **Uso:** Sirve para que TypeScript nos avise si nos estamos olvidando de algún campo cuando escribimos código.

### 2. Los Servicios (`.service.ts`) → El Trabajador
El Servicio es el único que tiene el permiso de "hablar" con Supabase.
- **Qué hace:** Usa el `SupabaseService` (que tiene la llave de la puerta) para hacer consultas.
- **Ejemplo:** El servicio dice: *"Supabase, tráeme todo de la tabla 'partidos' y ordénalo por fecha"*.

### 3. El `.env` → El Manojo de Llaves
Es el archivo que contiene la URL de tu proyecto y la Key (llave). Sin esto, el Backend es como un teléfono sin señal: no tiene a quién llamar.

---

## 🚀 Cómo levantamos la Base de Datos (Paso a Paso)

Para que todo funcione, seguimos este flujo:
1.  **Diseño en NestJS:** Creamos las clases (Entidades) con los campos que necesita el Mundial (Pasaporte, Estadio, Precio, etc.).
2.  **Traducción a SQL:** Como Supabase usa PostgreSQL, "traducimos" nuestras entidades a código SQL. 
    *   *Ejemplo:* `numeroPasaporte` (TS) → `numero_pasaporte` (SQL).
3.  **Ejecución en Supabase:** Copiamos ese SQL y lo ejecutamos en el SQL Editor de Supabase para crear las tablas físicas.
4.  **Automatización (Triggers):** Configuramos los Triggers para que la base de datos trabaje sola (ej: crear perfiles o inventarios automáticamente).

---

## 📋 Resumen de Piezas y Analogía

| Pieza en NestJS | Aporte a la Base de Datos | Analogía |
| :--- | :--- | :--- |
| **Entidad** | Define nombres de columnas y tipos de datos. | **La Receta** |
| **DTO** | Asegura que los datos entrantes sean válidos. | **El Tamiz/Filtro** |
| **Servicio** | Ejecuta las acciones (CRUD). | **El Cocinero** |
| **SupabaseService** | Puente de comunicación. | **La Despensa** |
| **Trigger** | Automatización lógica. | **El Robot de la despensa** |

---

## 🍪 Lógica de Inventario: El "Molde" y la "Galletita"

Para gestionar el stock de millones de entradas sin errores, usamos tres tablas:

1.  **`sectores_estadio` (El Molde):** Esta tabla es el molde. Dice: *"El sector 'Popular' siempre tiene capacidad para 20,000 personas"*. No cambia, es solo la definición física.
2.  **`partidos` (La Orden de Cocina):** Cuando insertas un partido nuevo (ej: "Argentina vs Francia"), es como si dieras una orden de cocinar un nuevo evento.
3.  **`partido_sectores` (La Galletita Real):** Aquí ocurre la acción. El **Trigger** está "escuchando" a la tabla `partidos`. En cuanto entra un partido nuevo, el Trigger dice: *"¡Ah! Un partido nuevo, rápido, traigan el molde (sectores_estadio) y creen una copia de los sectores para este partido específico en la tabla partido_sectores"*.

**¿Por qué lo hacemos así?**
Porque si usáramos solo la tabla `sectores_estadio`, cuando alguien compra una entrada para hoy, le estarías restando capacidad al estadio para siempre. Al tener `partido_sectores`, cada partido tiene sus propios lugares independientes.

---

## 🔐 Seguridad y Control de Accesos (RBAC)

Hemos actualizado la base de datos con piezas de seguridad blindada:

### Nueva Columna `rol` (Tabla Usuarios)
- **Qué es:** Define el nivel de poder de cada cuenta.
- **Valores:** `CLIENTE` (defecto), `ADMINISTRADOR`.
- **Importancia:** El Backend consulta esta columna antes de permitir acciones sensibles.

### Protección de Endpoints (El Guardia)
Conectamos la DB con un **Guardia de Roles** en NestJS. El sistema hace un "check" rápido a la base de datos para ver si tu rol tiene permiso antes de procesar cualquier cambio.

### Eliminación en Cascada (Derecho al Olvido)
Configuramos reglas `ON DELETE CASCADE`. Si un usuario se da de baja, la base de datos limpia automáticamente todos sus tickets y registros vinculados, evitando datos huérfanos.

---

## 🛠️ Scripts SQL de Migración (Copiar y Pegar)

### 1. Configuración de Roles y Cascada
```sql
-- Agregar columna rol y restricción
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'CLIENTE';
ALTER TABLE usuarios ADD CONSTRAINT check_rol_valido CHECK (rol IN ('CLIENTE', 'ADMINISTRADOR'));

-- Configurar borrado en cascada
ALTER TABLE entradas
DROP CONSTRAINT IF EXISTS entradas_id_usuario_fkey,
ADD CONSTRAINT entradas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;
```

### 2. Actualización de Auditoría
```sql
-- Asegurar campo rol en auditoría
ALTER TABLE usuarios_auditoria ADD COLUMN IF NOT EXISTS rol TEXT;

-- Función y Trigger actualizados
CREATE OR REPLACE FUNCTION funcion_copiar_a_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO usuarios_auditoria (usuario_id, email, nombre, apellido, rol)
    VALUES (NEW.id, NEW.email, NEW.nombre, NEW.apellido, NEW.rol);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_respaldo_usuarios ON usuarios;
CREATE TRIGGER trigger_respaldo_usuarios AFTER INSERT ON usuarios FOR EACH ROW EXECUTE FUNCTION funcion_copiar_a_auditoria();
```

### 3. Gestión de Inventario y Stock
```sql
-- Asegurar que el stock nunca sea negativo
ALTER TABLE partido_sectores 
ADD CONSTRAINT chk_stock_positivo CHECK (asientos_disponibles >= 0);

-- Función para restar stock automáticamente al insertar una entrada
CREATE OR REPLACE FUNCTION funcion_restar_stock_entrada()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE partido_sectores
    SET asientos_disponibles = asientos_disponibles - 1
    WHERE id_partido = NEW.id_partido 
      AND id_sector = NEW.id_sector;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que activa la resta automática
DROP TRIGGER IF EXISTS trigger_restar_stock_al_insertar ON entradas;
CREATE TRIGGER trigger_restar_stock_al_insertar
AFTER INSERT ON entradas
FOR EACH ROW
EXECUTE FUNCTION funcion_restar_stock_entrada();
```

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

## 🏗️ Principios de Diseño Aplicados

Para asegurar que el backend de TicketAR sea robusto y escalable, hemos aplicado los siguientes principios durante la implementación de los módulos de administración y usuarios:

1. **Principio de Responsabilidad Única (SRP):**
   - Hemos separado la **Seguridad** de la **Lógica de Negocio**. 
   - El `RolesGuard` se encarga exclusivamente de verificar permisos (Quién puede entrar).
   - El `PartidosService` se encarga exclusivamente de la integridad de los datos (Qué se puede hacer con el partido).
   - *Beneficio:* Si en el futuro cambiamos el sistema de autenticación (ej: de Headers a JWT), el código de los servicios no se ve afectado.

2. **Validación de Estado y Fallo Elegante (Graceful Failure):**
   - Antes de cualquier operación de mutación (`PATCH` o `DELETE`), el servicio valida la existencia del recurso mediante un check previo.
   - *Beneficio:* Evita que el sistema responda con éxito (`200 OK`) ante operaciones que no surtieron efecto, devolviendo en su lugar un `404 Not Found` preciso.

3. **Trazabilidad y Auditoría:**
   - La arquitectura está preparada para identificar al "actor" de cada acción administrativa. 
   - El uso de parámetros y headers específicos permite llevar un seguimiento de qué administrador modificó o eliminó un evento, garantizando la transparencia del sistema.

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
- [x] **Endpoints:** Completar gestión de partidos (`PATCH` / `DELETE`).
- [ ] **Estadísticas:** Implementar panel de estadísticas de ventas (Pendiente).

### 2. Cumplimiento de Privacidad y Gestión de Cuenta
- [x] **Baja de Usuario:** Implementación de `DELETE /usuarios/me`. Al borrar un usuario, se anulan sus registros de entradas en cascada para cumplir con el "Derecho al Olvido".
- [x] **Validación de Stock:** Asegurar que el decremento de asientos sea consistente mediante Triggers y Constraints en PostgreSQL.

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

---
*Documento preparado para integración en el Informe Definitivo.*

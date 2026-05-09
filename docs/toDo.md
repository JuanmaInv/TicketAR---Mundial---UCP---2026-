# 📋 Listado de Tareas (TicketAR)

## 🔄 Pendientes / En Proceso

### 1. Base de Datos y Documentación 🗄️
- [x] Documentar cambios en nombres de columnas de la base de datos.
- [x] Explicar funcionamiento de `partido_sectores` (Trigger + stock inicial).
- [ ] Verificar decremento de asientos al comprar tickets (Validación de lógica de stock).

### 2. Seguridad y Roles 🛡️
- [x] Agregar columna `rol` en tabla `usuarios` (Default: 'CLIENTE').
- [x] Crear Decorador `@Roles()` y `RolesGuard` en NestJS.
- [x] Proteger endpoints de creación de partidos (`POST /partidos`).

### 3. Endpoints de Administración ⚙️
- [x] Implementar `DELETE /partidos/:id`.
- [x] Implementar `PATCH /partidos/:id`.
- [ ] Implementar `GET /estadisticas` (Reporte de ventas e ingresos).

### 4. Privacidad y Cuenta 🗑️
- [x] Implementar "Darse de Baja" (`DELETE /usuarios/me`).
- [x] Asegurar eliminación en cascada de entradas del usuario en la DB.

---
*Última actualización: 09/05/2026 - Protocolo Erwin*
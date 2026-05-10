# 📋 Listado de Tareas (TicketAR)

## 🔄 Pendientes / En Proceso

### 1. Inteligencia de Negocio 📊 (Prioridad 1)
- [ ] Implementar `GET /estadisticas` (Reporte de ventas e ingresos).
  - [ ] Query para sumar ingresos totales.
  - [ ] Desglose por sector (Ocupación vs Capacidad).

### 2. Integración de Pagos Real 💳 (Prioridad 2)
- [ ] Crear endpoint de Webhook para pasarelas de pago.
- [ ] Implementar lógica de transición de estado `RESERVADO` -> `PAGADO` en base a confirmación externa.
- [ ] Manejo de errores en pagos fallidos/vencidos.

### 3. Notificaciones y Entrega de Tickets 📧 (Prioridad 3)
- [ ] Integrar servicio de envío de correos (ej: Resend/Nodemailer).
- [ ] Generar y adjuntar QR/PDF de la entrada tras confirmación de pago.

---

## ✅ Completado

### Base de Datos y Documentación 🗄️
- [x] Documentar cambios en nombres de columnas de la base de datos.
- [x] Explicar funcionamiento de `partido_sectores` (Trigger + stock inicial).
- [x] Verificar decremento de asientos al comprar tickets (Validación de lógica de stock).

### Seguridad y Roles 🛡️
- [x] Agregar columna `rol` en tabla `usuarios` (Default: 'CLIENTE').
- [x] Crear Decorador `@Roles()` y `RolesGuard` en NestJS.
- [x] Proteger endpoints de creación de partidos (`POST /partidos`).

### Endpoints de Administración ⚙️
- [x] Implementar `DELETE /partidos/:id`.
- [x] Implementar `PATCH /partidos/:id`.

### Privacidad y Cuenta 🗑️
- [x] Implementar "Darse de Baja" (`DELETE /usuarios/me`).
- [x] Asegurar eliminación en cascada de entradas del usuario en la DB.

---
*Última actualización: 09/05/2026 - Protocolo Erwin*
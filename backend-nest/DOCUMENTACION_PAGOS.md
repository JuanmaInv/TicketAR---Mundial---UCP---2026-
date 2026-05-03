# Documentación de Integración de Pagos - TicketAR 🎟️

Esta documentación detalla la implementación del sistema de pagos y validación de entradas para el proyecto TicketAR.

## 🚀 Flujo de Pago Automático

El sistema sigue un patrón de estados (State Pattern) para garantizar la seguridad:

1.  **Reserva:** El usuario elige un asiento y se crea un ticket en estado `RESERVADO`.
2.  **Pago:** Se genera una preferencia de Mercado Pago (Checkout Pro). El ticket queda bloqueado por 15 minutos (configurable).
3.  **Confirmación (Webhook):** Mercado Pago notifica a nuestro servidor (vía Ngrok en desarrollo) cuando el pago es aprobado.
4.  **Liberación:** El sistema cambia el estado a `PAGADO` y habilita la generación del código QR.
5.  **Acceso:** El usuario puede visualizar su QR en la plataforma para ingresar al estadio.

## 🔄 Ciclo de Vida del Ticket (Base de Datos)

Para entender por qué ves ciertos datos en Supabase, este es el mapa de estados:

| Paso | Acción Técnica | Estado en DB | Impacto en Inventario |
| :--- | :--- | :--- | :--- |
| **1. Reservar** | `POST /entradas` | `RESERVADO` | **-1 Asiento.** Bloqueado para otros usuarios. |
| **2. Pagar** | `POST /entradas/:id/pagar` | `RESERVADO` | Sin cambios. Solo genera el link de MP. |
| **3. Webhook** | `POST /payments/webhook` | `PAGADO` | **Confirmado.** El asiento queda ocupado permanentemente. |
| **4. Expirar** | Cron Job (Automático) | `EXPIRADO` | **+1 Asiento.** El lugar vuelve a estar disponible. |

### ¿Por qué veo muchos tickets en `RESERVADO`?
Es normal durante el desarrollo. Cada vez que alguien inicia el flujo pero no completa el pago en la ventana de Mercado Pago, la entrada queda en ese "limbo" de 15 minutos. El sistema está diseñado así para que nadie te "robe" el lugar mientras estás buscando la tarjeta en la billetera.

## 🛠️ Configuración de Desarrollo (Sandbox)

Para probar los pagos localmente sin usar dinero real:

### 1. Variables de Entorno (.env)
Asegurarse de tener configurado:
- `MP_ACCESS_TOKEN`: Token de tu "Test Seller" (Sandbox).
- `MP_WEBHOOK_URL`: Tu URL de Ngrok activa (Ej: `https://.../payments/webhook`).

### 2. Cuentas de Prueba
- **Vendedor:** El dueño de la aplicación en el panel de Mercado Pago.
- **Comprador:** Cuenta `TESTUSER...` creada en la sección de "Cuentas de prueba" de Mercado Pago Developers. 
- **Importante:** Siempre loguearse como el comprador en una ventana limpia/incógnito antes de usar el link de pago.

## 🧪 Herramientas de Prueba

### Script de Prueba Integral (`test-sandbox.js`)
Hemos creado un script que automatiza todo el proceso de reserva y generación de link para evitar errores manuales:
```bash
node backend-nest/test-sandbox.js
```
**¿Qué hace este script?**
- Busca automáticamente un usuario con pasaporte en tu base de datos.
- Busca un partido y un sector disponible.
- Crea la reserva vía API.
- Genera y muestra el **Link de Pago** real en la terminal.

### Verificación de QR
Una vez que un ticket está en estado `PAGADO`, el backend habilita el endpoint:
`GET /entradas/:id/qr`
Este devuelve la imagen en formato Base64 lista para ser mostrada en el frontend.

## 📝 Decisiones Arquitectónicas
- **Strategy Pattern:** Permite cambiar entre Mercado Pago, Stripe o un Simulador solo cambiando una variable de entorno.
- **State Pattern:** El ticket "sabe" qué acciones permite (ej: no se puede generar QR si está reservado).
- **Webhooks:** Se procesan en `PaymentsController` para asegurar que la actualización de stock y estado sea asíncrona y confiable.

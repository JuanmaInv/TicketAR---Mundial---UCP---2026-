# Documentación de Integración de Pagos - TicketAR 🎟️

Esta documentación detalla la implementación del sistema de pagos y validación de entradas para el proyecto TicketAR.

## 🚀 Flujo de Pago Automático

El sistema sigue un patrón de estados (State Pattern) para garantizar la seguridad:

1.  **Reserva:** El usuario elige un asiento y se crea un ticket en estado `RESERVADO`. El `EntradasService` valida la regla de 6 tickets y el stock.
2.  **Pago (Estrategia):** Dependiendo de la configuración, se usa una `IPaymentStrategy`. Si es Mercado Pago, se genera un link de pago.
3.  **Confirmación (Webhook):** Mercado Pago notifica a nuestro servidor (vía Ngrok en desarrollo) cuando el pago es aprobado.
4.  **Transición de Estado (State Pattern):** El objeto `ReservadoState` recibe la confirmación, valida que la reserva no haya expirado y transiciona el ticket a `PAGADO`.
5.  **Acceso:** Una vez en estado `PAGADO`, el sistema habilita la generación del código QR único.

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

## 🌐 El Rol de Ngrok (¿Por qué lo usamos?)

Durante el desarrollo, nuestro servidor NestJS corre de forma privada en la computadora (`http://localhost:3000`). Cuando un pago se aprueba, **Mercado Pago necesita enviar una notificación (Webhook)** a nuestro servidor para avisar que la compra fue exitosa. 

Como Mercado Pago está en Internet, no puede enviar datos a `localhost`. 

**Ngrok** soluciona esto actuando como un puente o "túnel reverso". Nos proporciona una URL pública (ejemplo: `https://4a3b-200.ngrok-free.app`) que redirige todo el tráfico directamente a nuestro `localhost:3000`.
- Esta es la URL que debemos configurar en el panel de Mercado Pago.
- Gracias a Ngrok, nuestro servidor local puede recibir el evento "Payment Success" y actualizar el estado de la entrada a `PAGADO`.

### 2. El Ciclo de Retroalimentación (Webhook + Ngrok)
Como `localhost` es invisible para Internet, Mercado Pago no puede avisarnos directamente. Ngrok actúa como un "túnel" que expone nuestro puerto 3000.
1. Mercado Pago envía un POST a la URL de Ngrok.
2. Ngrok redirige ese POST a nuestro `PaymentsController`.
3. El controlador delega la verificación a la estrategia activa.
4. Si la estrategia confirma el éxito, el ticket cambia de estado.

### Verificación de QR
Una vez que un ticket está en estado `PAGADO`, el backend habilita el endpoint:
`GET /entradas/:id/qr`
Este devuelve la imagen en formato Base64 lista para ser mostrada en el frontend.

## 📝 Decisiones Arquitectónicas

- **Strategy Pattern:** Implementado en `PaymentsService`. Permite alternar entre `MercadoPagoStrategy` (Real) y `SimulatedPaymentStrategy` (Mock) sin cambiar el código del servicio. La elección es automática basada en la presencia del `MP_ACCESS_TOKEN`.
- **State Pattern:** Implementado en `src/tickets/states`. Desacopla la lógica de validación de transiciones del `EntradasService`. Cada estado (`ReservadoState`, `PagadoState`, `CanceladoState`) es responsable de permitir o denegar acciones (como cancelar o pagar), protegiendo la integridad del negocio.
- **Layered Architecture:** 
    - **Controller:** Maneja el tráfico HTTP (Mozo).
    - **Service:** Orquesta la lógica de negocio (Cocinero).
    - **Repository:** Abstrae la persistencia de datos (Despensa).
- **Webhooks:** Se procesan en `PaymentsController` para asegurar que la actualización de stock y estado sea asíncrona y confiable.

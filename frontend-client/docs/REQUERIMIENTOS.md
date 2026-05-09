# Requerimientos TicketAR - Mundial 2026

Este documento detalla los requerimientos funcionales y no funcionales del sistema TicketAR, enfocándose en la seguridad, usabilidad y eficiencia.

## 1. Requerimientos Funcionales (RF)

| ID | Requerimiento | Descripción | Prioridad |
|----|---------------|-------------|-----------|
| RF-01 | **Validación de Identidad** | El ingreso al estadio requiere Pasaporte/DNI cargado en la cuenta del titular. | CRÍTICA |
| RF-02 | **Límite de Entradas** | Máximo de 6 entradas por cuenta de usuario por partido. | ALTA |
| RF-03 | **Reserva Temporal** | El sistema bloquea el lugar por 15 minutos hasta confirmar el pago. | ALTA |
| RF-04 | **Generación de QR** | Generación de un QR único por entrada tras confirmar el pago. | CRÍTICA |
| RF-05 | **Resumen de Compra** | Mostrar desglose detallado (Sector, Cantidad, Total) antes del pago. | MEDIA |
| RF-06 | **Edición de Datos** | Permitir al usuario actualizar sus datos de perfil durante el flujo de compra. | MEDIA |
| RF-07 | **Control de Capacidad** | Bloquear la venta si el sector o el partido están agotados. | ALTA |
| RF-08 | **Reventa Oficial** | Sistema integrado para poner tickets a la venta con comisión oficial. | BAJA |

## 2. Requerimientos No Funcionales (RNF)

| ID | Tipo | Requerimiento | Descripción |
|----|------|---------------|-------------|
| RNF-01 | **Disponibilidad** | El sistema debe ser resiliente (Persistencia de timer ante recargas). |
| RNF-02 | **Usabilidad** | Diseño responsivo (Mobile-First) y cumplimiento de principios de Nielsen. |
| RNF-03 | **Seguridad** | Integración con Stripe/Mercado Pago sin almacenar datos sensibles de tarjetas. |
| RNF-04 | **Rendimiento** | Optimización de imágenes (Next/Image) y carga rápida (WorldCupLoader). |
| RNF-05 | **Escalabilidad** | Capacidad para soportar picos de tráfico durante la venta de entradas. |
| RNF-06 | **Robustez** | CI/CD automatizado para asegurar que cada despliegue cumple con lint y tipos. |

## 3. Principios de Usabilidad Aplicados (Jakob Nielsen)

1.  **Visibilidad del estado**: Timer de reserva siempre visible.
2.  **Relación con el mundo real**: Términos claros (Platea, Popular, Palco).
3.  **Control del usuario**: Botones de "Volver" en cada paso del checkout.
4.  **Consistencia**: Uso de sistema de diseño coherente y temas (Dark/Light).
5.  **Prevención de errores**: Deshabilitar botones de compra si los datos están incompletos o agotados.
6.  **Reconocimiento**: Resumen de compra antes del pago final.
7.  **Flexibilidad**: Acceso rápido a "Mis Entradas" y "Mis Datos" desde el Navbar.
8.  **Estética**: Diseño premium inspirado en la identidad de la FIFA World Cup 2026.
9.  **Recuperación de errores**: Mensajes amigables y accionables en caso de rechazo de pago.
10. **Ayuda**: Sección de FAQ integrada para resolver dudas comunes.

# Registro de Pasos - Implementación TicketAR

Este documento registra paso a paso las modificaciones realizadas en el proyecto, siguiendo las indicaciones de trabajar con commits cortos, uso del backend real, y variables en español.

## Paso 1: Creación del Calendario de Partidos
**Rama**: `feat/calendario-partidos`

- **Objetivo**: Crear un calendario literal en la página de inicio que muestre todos los partidos disponibles traídos desde el backend.
- **Acciones Realizadas**:
  - Se creó la rama `feat/calendario-partidos`.
  - Se desarrolló el componente `components/calendar/CalendarComponent.tsx`.
  - Se utilizó `getPartidos()` (que conecta al backend real en el puerto 3000) para obtener los datos (`id`, `equipo_local`, `equipo_visitante`, `fecha_partido`, etc.).
  - Se implementó la lógica en español: `fechaActual`, `partidos`, `cambiarMes`, `diasEnMes`, entre otras variables, evitando el uso de inglés salvo en palabras reservadas de React/TypeScript.
  - Se diseñaron "cuadraditos" (slots) por cada día del mes. Si hay partidos ese día, se listan mostrando las banderas, hora, fase y un enlace directo al checkout (`/checkout/[id]`).
- **Estado**: Listo para confirmación (Commit).

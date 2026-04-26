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
- **Estado**: Finalizado y comiteado (`[feat/calendario-partidos 4ad6ce4]`).

## Paso 2: Rediseño de la Landing Page (Página de Inicio)
**Rama**: `feat/calendario-partidos`

- **Objetivo**: Integrar el componente de calendario, remover los mockups antiguos del home, y transformar la página principal en una página de venta (Landing Page) orientada al producto real, y no cómo proyecto académico.
- **Acciones Realizadas**:
  - Se modificó `app/page.tsx` para reemplazar la grilla por 4 secciones claras.
  - **Hero Section**: Un encabezado de inicio persuasivo enfocado en la "pasión" y en la tecnología única de TicketAR.
  - **Calendario Integrado**: Se renderizó `<ComponenteCalendario />` debajo del Hero.
  - **Instrucciones de Compra**: Una guía visual de 3 pasos ("Elige tu Partido", "Completa tus Datos", "Pago y Tickets").
  - **Redirección a "Sobre Nosotros"**: Una sección final reforzando la seguridad y confianza para promover que el cliente entre a la página del equipo.
- **Estado**: Listo para confirmación (Commit).

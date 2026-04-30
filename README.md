# TicketAR - Sistema de Venta de Entradas Mundial 2026

TicketAR es una plataforma integral para la gestión y compra de entradas para el Mundial 2026, desarrollada con tecnologías modernas y aplicando patrones de diseño de software.

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos partes principales:
- **`backend-nest`**: API construida con NestJS que gestiona la lógica de negocio, estados de tickets y persistencia.
- **`frontend-client`**: Aplicación web construida con Next.js 15+ (App Router) y Tailwind CSS.

## 🧩 Patrones de Diseño Aplicados

Para cumplir con los estándares de ingeniería de software, se han implementado los siguientes patrones:

1.  **State Pattern**: Gestiona los estados de los tickets (`Reservado`, `Pagado`, `Cancelado`) permitiendo transiciones seguras.
2.  **Strategy Pattern**: Define diferentes estrategias de pago (actualmente `SimulatedPayment`).
3.  **Repository Pattern**: Abstrae la persistencia de datos (Supabase) de la lógica de negocio.
4.  **Factory Pattern**: Centraliza la creación de los estados de los tickets.

## 🚀 Instalación y Ejecución

### Requisitos Previos
- Node.js v20+
- `pnpm` instalado globalmente (`npm install -g pnpm`)

### Configuración del Entorno
1. Clona el repositorio.
2. Crea tus archivos `.env` (backend) y `.env.local` (frontend) basándote en el archivo `.env.example` de la raíz.

### Backend
```powershell
cd backend-nest
pnpm install
pnpm run start:dev
```

### Frontend
```powershell
cd frontend-client
pnpm install
pnpm run dev
```
La aplicación estará disponible en `http://localhost:3001`.

## 🧪 Testing

### Backend (Unit Tests)
```powershell
cd backend-nest
pnpm run test
```

### E2E / Integración (Playwright)
```powershell
cd frontend-client
pnpm exec playwright test
```

## 📝 Convenciones de Commits
- `feat:` Funcionalidades nuevas.
- `fix:` Corrección de errores.
- `docs:` Cambios en documentación.
- `refactor:` Mejoras en el código sin cambiar funcionalidad.
- `chore:` Tareas de mantenimiento o configuración.


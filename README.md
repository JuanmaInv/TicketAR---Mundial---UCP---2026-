# TicketAR - Sistema de Venta de Entradas Mundial 2026

TicketAR es una Plataforma (Web App) de Gestión y Compra de entradas para el Mundial 2026, desarrollada con tecnologías de Backend, Frontend, Testing, ademas de aplicar patrones de diseño de software y conceptos dados de POO.

## Arquitectura del Proyecto

El proyecto está dividido en dos partes principales:
- *backend-nest*: API construida con NestJS que gestiona la lógica de negocio, estados de tickets, métodos de pago y persistencia.
- *frontend-client*: Aplicación web construida con Next.js 15+ (App Router), Tailwind CSS, TypeScript (.tsx, .ts) y JavaScript (.jsx, .js).

<p align="center">
  <img src="https://img.shields.io/badge/IDE-Antigravity-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI_Agent-Codex-black?style=for-the-badge&logo=openai" />
  <img src="https://img.shields.io/badge/AI_Agent-Gemini-blue?style=for-the-badge&logo=googlegemini" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-NestJS-red?style=for-the-badge&logo=nestjs" />
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DB-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel" />
  <img src="https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Payments-Mercado_Pago-009EE3?style=for-the-badge&logo=mercadopago" />
  <img src="https://img.shields.io/badge/Auth-Clerk-6C47FF?style=for-the-badge&logo=clerk" />
</p>

## Patrones de Diseño Aplicados

Para cumplir con los estándares de ingeniería de software, se han implementado los siguientes patrones de diseño:

1.  *State Pattern*: Gestiona y define los diferentes estados de los tickets.
2.  *Strategy Pattern*: Define los diferentes métodos de pago (y otras funcionalidades que requieran distintos comportamientos).
3.  *Repository Pattern*: Realiza las operaciones (CRUD) sobre la Base de Datos (a través de Supabase).
4.  *Factory Pattern*: Centraliza y parametrisa la creación de objetos.
Posible Observer (a implementar)
## Instalación y Ejecución

### Requisitos Previos
- Node.js v20+
- pnpm instalado globalmente (npm install -g pnpm)

### Configuración del Entorno
1. Clona el repositorio.
2. Crea tus archivos de entorno (.env para backend, .env.local para frontend) basándote en los archivos .env.example de sus respectivas carpetas.

### Backend
powershell
cd backend-nest
pnpm install
pnpm run start:dev


### Frontend
powershell
cd frontend-client
pnpm install
pnpm run dev

La aplicación estará disponible en http://localhost:3001.

## Testing

### Backend (Unit Tests)
powershell
cd backend-nest
pnpm run test


### E2E / Integración (Playwright)
powershell
cd frontend-client
pnpm exec playwright test


## Convenciones de Commits
- feat:: Funcionalidades nuevas.
- fix:: Corrección de errores.
- docs:: Cambios en documentación.
- refactor:: Mejoras en el código sin cambiar funcionalidad.
- chore:: Tareas de mantenimiento o configuración.

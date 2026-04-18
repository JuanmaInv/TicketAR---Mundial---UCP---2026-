# Informe Definitivo: TicketAR - Mundial 2026

## 🎯 Visión y Lógica de Negocio
Desarrollar una plataforma de venta de entradas enfocada en la seguridad y eliminación de la reventa ilegal.
- **Validación:** Entrada obligatoria con Pasaporte.
- **Regla Crítica:** Máximo 1 entrada por sesión por usuario.
- **Reserva:** El servidor bloquea el lugar por tiempo limitado (ej. 15 min) hasta confirmar pago.
- **Sectores:** Control de capacidad estricto por PLATEA, PALCO, POPULAR y PRENSA.
- **Entregable:** Generación de código QR enviado por correo tras confirmar el pago.
- **Reventa:** Sistema oficial integrado en la plataforma con comisión.

## 🛠️ Stack Tecnológico (Monorepo)
- **Backend:** NestJS (Modular) en `/backend-nest`.
- **Frontend:** Next.js + Tailwind en `/frontend-client`.
- **Database/Auth:** Supabase (No usar Clerk).
- **Pagos:** Stripe (Int) / Mercado Pago (Local). No almacenar datos de tarjetas.
- **Testing:** Playwright (E2E y estrés).
- **Métricas:** Graphana para medir el compromiso del equipo.

## 📂 Gestión de Dependencias y Entorno (Estricto)
- **Instalación:** Ejecutar `npm install` solo en la carpeta del rol correspondiente.
- **Seguridad:** `.env` está en `.gitignore`. NUNCA subir llaves privadas.
- **Plantilla:** Usar `.env.example` para que el equipo sepa qué variables configurar.

## ⚙️ CI/CD y Workflows de Integración
- **Integración Continua:** Automatización mediante GitHub Actions. Existe `backend-ci.yml` para validar NestJS y se añadirá próximamente `frontend-ci.yml` para React/Next.js.
- **Triggers:** Se utiliza el wildcard `feat/**` para que las pruebas corran automáticamente en todas las ramas de nuevas funcionalidades tras cada Push o PR.

## 🌿 Flujo de Git y Colaboración (Branch-per-Feature)
1. **Adopción > Funcionalidad:** Usar herramientas simples que el equipo use a diario.
2. **Branching:** Ramas dedicadas por funcionalidad (ej. `feat/ticket-reservation`, `feat/auth-passport`, `fix/`, `chore/`). El frontend debe seguir el mismo patrón.
3. **Protección:** Gatear `main` mediante Pull Requests (PR) y revisión de código. Prohibido hacer merge directo a main.
4. **Issues:** Una tarea = Una Issue en GitHub. Evitar subtareas confusas; usar "Relationships".
5. **Sync:** Sincronizar (Rebase/Sync) con `main` diariamente para evitar conflictos.
6. **Commits Semánticos:** Seguir el estándar definido en el proyecto.
7. **Documentación:** Preferir metodologías *Docs-as-Code* (guardar en `/docs`) para que las reglas de negocio viajen con la versión de código correspondiente.

## 🤖 Protocolo Erwin (IA Tutor)
- **Método Socrático:** No dar código completo. Proporcionar pistas, teoría y fragmentos educativos.
- **Foco Backend:** Erwin es Backend Engineer. Priorizar lógica de servicios, DTOs y seguridad en NestJS.
- **Contexto:** Si falta información, preguntar antes de asumir.
- **Visión Fullstack y API (Nuevo):** Erwin debe explicar siempre cómo los controladores y endpoints de NestJS serán consumidos posteriormente desde el Frontend (React/Next.js con TypeScript) mediante DTOs e interfaces, asegurando que el backend exponga datos limpios y tipados.

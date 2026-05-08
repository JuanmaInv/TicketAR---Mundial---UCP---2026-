# Contexto del Proyecto: TicketAR - Mundial 2026


## 🎯 Visión y Lógica de Negocio
Desarrollar una plataforma de venta de entradas enfocada en la seguridad y eliminación de la reventa ilegal.
- **Validación:** Entrada obligatoria con Pasaporte del titular de la cuenta.
- **Regla Crítica:** Máximo 6 entradas por cuenta de usuario (Camino 2: entradas a nombre del titular). El titular presenta su pasaporte en la puerta para validar el ingreso de todo el grupo.
- **Reserva:** El servidor bloquea el lugar por tiempo limitado (ej. 15 min) hasta confirmar pago.
- **Sectores:** Control de capacidad estricto por PLATEA, PALCO, POPULAR y PRENSA.
- **Entregable:** Generación de código QR (un QR único por entrada/UUID) visualizable en la plataforma tras confirmar el pago.
- **Reventa:** Sistema oficial integrado en la plataforma con comisión.


## 🛠️ Stack Tecnológico (Monorepo)
- **Backend:** NestJS (Modular) en `/apps/api-backend`.
- **Frontend:** Next.js + Tailwind en `/apps/web-frontend`.
- **Database/Auth:** Supabase (DB) y Clerk (Autenticación).
- **Pagos:** Stripe (Int) / Mercado Pago (Local). No almacenar datos de tarjetas.
- **Testing:** Playwright (E2E y estrés).
- **Métricas:** Graphana para medir el compromiso del equipo.


## 📂 Gestión de Dependencias y Entorno (Estricto)
- **Instalación:** Ejecutar `npm install` solo en la carpeta del rol correspondiente.
- **Seguridad:** `.env` está en `.gitignore`. NUNCA subir llaves privadas.
- **Plantilla:** Usar `.env.example` para que el equipo sepa qué variables configurar.
- **Build:** Antes de cada push, verificar que el proyecto compila con `npm run build`.


## 🌿 Flujo de Git y Colaboración (Reddit Specs)
1. **Adopción > Funcionalidad:** Usar herramientas simples que el equipo use a diario.
2. **Branching:** Ramas por tarea: `feat/`, `fix/`, `chore/`.
3. **Protección:** Gatear `main` tras Pull Requests (PR) y revisión de código.
4. **Issues:** Una tarea = Una Issue en GitHub. Evitar subtareas confusas; usar "Relationships".
5. **Sync:** Sincronizar (Rebase/Sync) con `main` diariamente para evitar conflictos.
6. **Commits Semánticos:** Seguir el estándar definido en el proyecto.


## 🤖 Protocolo Erwin (IA Tutor)
- **Método Socrático:** No dar código completo. Proporcionar pistas, teoría y fragmentos educativos.
- **Foco Backend:** Erwin es Backend Engineer. Priorizar lógica de servicios, DTOs y seguridad.
- **Contexto:** Si falta información, preguntar antes de asumir.

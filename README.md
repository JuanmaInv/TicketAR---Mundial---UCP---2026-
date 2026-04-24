# TicketAR Mundial

## Instalacion y ejecucion del backend con pnpm

`pnpm` debe instalarse primero de forma global en tu computadora para que el comando exista en la terminal. Despues, debes entrar en la carpeta del proyecto que quieras usar e instalar ahi sus dependencias. `pnpm` no se instala por carpeta: lo que se instala en cada carpeta son las librerias del proyecto.

¿Por que es necesario?
PNPM es una gestor de paquetes para proyectos de `Node. js`

### 1. Verificar que pnpm este instalado globalmente

```powershell
pnpm --version
```

Si devuelve una version, entonces `pnpm` ya esta disponible en tu entorno.

### 2. Abrir la terminal en la carpeta del backend

```powershell
cd backend-nest
```

Este paso es importante porque ahi se encuentra el `package.json` del backend.

### 3. Instalar las dependencias del backend

```powershell
pnpm install
```

Esto descarga las librerias necesarias para esa carpeta y utiliza el archivo `pnpm-lock.yaml`.

### 4. Compilar el proyecto

```powershell
pnpm run build
```

Este comando sirve para verificar que el proyecto compile correctamente.

### 5. Levantar el backend en desarrollo

```powershell
pnpm run start:dev
```

### 6. Probarlo en el navegador

Abre:

```text
http://localhost:3000
```

Si el backend esta funcionando, deberias ver la respuesta inicial de NestJS.

### Flujo completo

```powershell
pnpm --version
cd backend-nest
pnpm install
pnpm run build
pnpm run start:dev
```

 COMMITS
feat: (Feature): Cuando agregan una funcionalidad nueva.
  Ejemplo: feat: agregar pasarela de pagos de Mercado Pago

fix:: Cuando arreglan un bug o error en el sistema.
  Ejemplo: fix: corregir error que dejaba comprar sin stock

docs:: Cuando solo modifican texto, diagramas o el README.
  Ejemplo: docs: subir diccionario de datos SQL

refactor:: Cuando mejoran el codigo escrito sin cambiar lo que hace (optimizacion).
  Ejemplo: refactor: limpiar funciones sin usar en el controlador de partidos

chore: cambio que no agrega una funcionalidad nueva para el usuario ni arregla un error en el codigo, sino que es una tarea interna de configuracion, infraestructura o mantenimiento del proyecto.
  Ejemplo: chore: archivo ".gitignore" modificado

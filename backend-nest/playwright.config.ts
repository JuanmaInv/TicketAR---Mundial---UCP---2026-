import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Directorio donde se encuentran los tests
  testDir: './Playwright Tests/Tests',

  // Tiempo máximo para cada test
  timeout: 30_000,

  // Reintentos en caso de fallo
  retries: 0,

  // Configuración para las peticiones HTTP (API Testing)
  use: {
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },

  /*
  // Servidor web que se debe levantar antes de los tests
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  */

  // Reporter para ver los resultados
  reporter: [['html', { open: 'never' }], ['list']],
});

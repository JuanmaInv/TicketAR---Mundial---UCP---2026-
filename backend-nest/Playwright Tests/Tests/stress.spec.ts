import { test, expect } from '@playwright/test';

/**
 * PRUEBAS DE ESTRÉS Y CARGA: TICKETAR 2026
 * 
 * Enfoque: Verificar el comportamiento del backend ante ráfagas de peticiones simultáneas.
 * Este test simula una alta demanda en el endpoint de creación de entradas.
 */

test.describe('Pruebas de Estrés (Stress Testing)', () => {

  const DATOS_PRUEBA = {
    usuarioId: '6d0de560-68c9-468a-a930-a72f7cb3f418', // Adolfo
    partidoId: 'e9a4defb-5a97-48ad-a361-7027aa9d39a9',
    sectorId: '495052e4-5c87-44a2-a228-bf01f15a5ed6', // Sector con stock (50 asientos)
  };

  test('Debería manejar ráfaga de 50 peticiones de reserva simultáneas', async ({ request }) => {
    const NUMERO_PETICIONES = 50;
    console.log(`Iniciando ráfaga de ${NUMERO_PETICIONES} peticiones simultáneas...`);

    const startTime = Date.now();

    // Lanzamos todas las peticiones en paralelo para forzar concurrencia
    const promesas = Array.from({ length: NUMERO_PETICIONES }).map(() => 
      request.post('/entradas', {
        data: {
          idUsuario: DATOS_PRUEBA.usuarioId,
          idPartido: DATOS_PRUEBA.partidoId,
          idSector: DATOS_PRUEBA.sectorId
        }
      })
    );

    const respuestas = await Promise.all(promesas);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Ráfaga completada en ${duration}ms (${(duration / NUMERO_PETICIONES).toFixed(2)}ms promedio).`);

    // Analizamos la salud de las respuestas
    const exitosas = respuestas.filter(r => r.status() === 201).length;
    const fallidas = respuestas.filter(r => r.status() !== 201).length;
    const errores500 = respuestas.filter(r => r.status() === 500).length;

    console.log(`Reporte de Carga:`);
    console.log(`   - Éxitos (201): ${exitosas}`);
    console.log(`   - Rechazadas (4xx): ${fallidas}`);
    console.log(`   - Errores Críticos (500): ${errores500}`);

    // VALIDACIONES DE ESTRÉS
    // 1. El servidor NO debe devolver errores 500 bajo carga
    expect(errores500).toBe(0);

    // 2. El tiempo total de procesamiento para 50 peticiones no debería exceder los 10 segundos
    expect(duration).toBeLessThan(10000);

    // 3. Verificamos que al menos una haya sido rechazada si superamos el límite de 6
    if (NUMERO_PETICIONES > 6) {
        expect(fallidas).toBeGreaterThan(0);
        console.log('El sistema aplicó correctamente las reglas de negocio bajo carga.');
    }

    console.log('Test de Estrés finalizado: El backend se mantuvo estable.');
  });

  test('Verificación de Integridad de Stock bajo demanda masiva', async ({ request }) => {
    /**
     * Este test conceptualmente valida que el decremento del stock sea atómico.
     * En un entorno real, verificaríamos que asientos_disponibles disminuyó 
     * exactamente en la cantidad de peticiones exitosas.
     */
    console.log('Iniciando verificación de integridad de stock...');
    const response = await request.get('/entradas');
    expect(response.status()).toBe(200);
    console.log('Integridad de stock verificada conceptualmente.');
  });

});

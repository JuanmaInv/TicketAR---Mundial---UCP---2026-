import { test, expect } from '@playwright/experimental-ct-react';
import BuyerForm from './BuyerForm';
import { DatosCompra } from '@/types/ticket';

test.describe('BuyerForm Component Integration', () => {
  
  test('Renderiza correctamente todos los campos', async ({ mount }) => {
    // Montamos el componente real (esto es una prueba de integración frontend)
    const component = await mount(
      <BuyerForm 
        partidoId="test-123" 
        onValidacionExitosa={() => {}} 
      />
    );

    // Verificamos que el formulario y sus campos principales se renderizan
    await expect(component.getByRole('heading', { name: /Datos del Comprador/i })).toBeVisible();
    await expect(component.locator('input[name="nombre"]')).toBeVisible();
    await expect(component.locator('input[name="apellido"]')).toBeVisible();
    await expect(component.locator('input[name="documento"]')).toBeVisible();
    await expect(component.locator('input[name="email"]')).toBeVisible();
    await expect(component.getByRole('button', { name: /Validar Datos y Continuar/i })).toBeVisible();
  });

  test('Muestra errores de validación al enviar campos vacíos', async ({ mount }) => {
    let fueLlamadoExitosamente = false;

    const component = await mount(
      <BuyerForm 
        partidoId="test-123" 
        onValidacionExitosa={() => { fueLlamadoExitosamente = true; }} 
      />
    );

    // Intentamos hacer submit del formulario sin llenar nada
    await component.getByRole('button', { name: /Validar Datos y Continuar/i }).click();

    // Verificamos que se muestren los mensajes de error en pantalla 
    // y que la función de éxito NO se haya llamado
    await expect(component.getByText('* Este campo es obligatorio.').first()).toBeVisible();
    expect(fueLlamadoExitosamente).toBe(false);
  });

  test('Permite llenar los campos y limpia los errores de validación', async ({ mount }) => {
    let datosEnviados: DatosCompra | null = null;

    const component = await mount(
      <BuyerForm 
        partidoId="test-123" 
        onValidacionExitosa={(datos) => { datosEnviados = datos; }} 
      />
    );

    // Llenamos datos inválidos al principio
    await component.locator('input[name="email"]').fill('correo_invalido');
    await expect(component.getByText('* Por favor ingresa un email válido.')).toBeVisible();

    // Corregimos con datos válidos
    await component.locator('input[name="nombre"]').fill('Juan');
    await component.locator('input[name="apellido"]').fill('Pérez');
    await component.locator('input[name="documento"]').fill('12345678');
    await component.locator('input[name="email"]').fill('juan@test.com');
    await component.locator('input[name="telefono"]').fill('1122334455');
    
    await component.locator('select[name="provincia"]').selectOption('Córdoba');
    await component.locator('input[name="localidad"]').fill('Capital');
    await component.locator('input[name="cantidad"]').fill('2');

    // Al tener el email correcto, el error debería desaparecer
    await expect(component.getByText('* Por favor ingresa un email válido.')).not.toBeVisible();

    // Enviamos el formulario
    await component.getByRole('button', { name: /Validar Datos y Continuar/i }).click();

    // Verificamos que los datos fueron capturados correctamente
    if (datosEnviados === null) {
      throw new Error('No se recibieron datos del formulario');
    }
    const datosConfirmados: DatosCompra = datosEnviados;
    expect(datosConfirmados.cantidad).toBe(2);
  });
});

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Una funcion asincrona es una funcion que no espera a que se termine de ejecutar
  // y puede ejecutar otras operaciones mientras espera que algo termine.
  // Por eso se usa await para esperar a que la funcion termine antes de continuar.
  const app = await NestFactory.create(AppModule); // Crea la instancia de la aplicacion.

  // --- CONFIGURACIÓN DE SEGURIDAD Y VALIDACIÓN ---

  // Escudo de seguridad global para validar DTOs (Data Transfer Objects)
  // Esto asegura que los datos que vienen del frontend sean exactamente lo que esperamos.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina campos que no estén en el DTO
      forbidNonWhitelisted: true, // Rechaza la petición si hay campos extra
      transform: true, // Transforma los datos a los tipos de TypeScript del DTO
    }),
  );

  // Configure el CORS para que el front pueda acceder al backend.
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: true, // permite que el backend guarde cookies del frontend.
  });

  await app.listen(process.env.PORT ?? 3000); // el puerto donde corre el backend.
}

// Ejecuta la funcion bootstrap para iniciar el servidor
void bootstrap();

// Este documento es el punto de entrada de la aplicacion.
// Aquí se han configurado la validación, el CORS y el puerto donde corre el backend.

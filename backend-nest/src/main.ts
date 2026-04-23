import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() { //Una funcion asincrona es una funcion que no espera a que se termine de ejecutar
  //y puede ejecutar otras operaciones mientras espera que algo termine.
  // Por eso se usa await
  //para esperar a que la funcion termine antes de continuar.
  const app = await NestFactory.create(AppModule); // Crea la instancia de la aplicacion.
  // NestFactory.create(AppModule): Esta es la forma en que NestJS crea una instancia de mi aplicación.
  // AppModule: Es el módulo raíz de mi aplicación (definido en app.module.ts).

  app.enableCors({ //Configure el CORS para que el front pueda acceder al backend.  
    origin: 'http://localhost:3001', //aqui va el link de tu app si esta en produccion
    methods: 'GET,POST,PUT,DELETE', // los metodos que permitimos que se usen 
    credentials: true, // permite que el backend guarde cookies del frontend.
  });
  await app.listen(process.env.PORT ?? 3000); // el puerto donde corre el backend.
}
void bootstrap(); // Ejecuta la funcion bootstrap

// Este documento es el punto de entrada de la aplicacion.
// Aquí se han configurado el CORS y el puerto donde corre el backend // frontend.  


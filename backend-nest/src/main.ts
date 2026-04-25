import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Escudo de seguridad global para validar DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Elimina campos que no estén en el DTO
    forbidNonWhitelisted: true,  // Rechaza la petición si hay campos extra
    transform: true,             // Transforma los datos a los tipos de TypeScript del DTO
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


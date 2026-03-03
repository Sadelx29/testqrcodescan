import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para que el frontend pueda conectarse
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0'); // Escuchar en todas las interfaces
  console.log(`🚀 [BACKEND] Servidor corriendo en http://10.0.0.8:${port}`);
  console.log(`🌐 [BACKEND] Escuchando en todas las interfaces (0.0.0.0:${port})`);
}
bootstrap();

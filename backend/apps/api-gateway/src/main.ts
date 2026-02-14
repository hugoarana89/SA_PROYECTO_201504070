import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  //app.setGlobalPrefix('api'); // prefijo global para todas las rutas

  // Configuración del pipe de validación global

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina las propiedades que no están en el DTO
      forbidNonWhitelisted: true, // lanza un error si hay propiedades no permitidas
      transform: true, // transforma los payloads a los tipos definidos en los DTOs
    }),
  );

  // Configuración CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });


  morgan.token('body', (req: any) => JSON.stringify(req.body));
    app.use(
      morgan(':method :url :status :response-time ms - body: :body'),
    );

    
  /*
  // para ver en consola las peticiones HTTP
  if (process.env.NODE_ENV !== 'production') {
    //app.use(morgan('dev'));
    morgan.token('body', (req: any) => JSON.stringify(req.body));
    app.use(
      morgan(':method :url :status :response-time ms - body: :body'),
    );
  }*/


  const port = process.env.GATEWAY_PORT || 4000;
  await app.listen(port);
  console.log(`🚀 API Gateway running on port ${port}`);
}
bootstrap();

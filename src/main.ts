import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(json({ limit: '100mb' }));
  app.enableCors({origin: '*'})
  await app.listen(3333)
  console.log(`App is running on 3333 🚀`);
  
}
bootstrap()

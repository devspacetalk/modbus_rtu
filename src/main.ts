import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';
import { AppModule } from './app.module';
import { setupSwagger } from './util/swagger';
import hbs = require('hbs');

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupSwagger(app);
  await app.startAllMicroservicesAsync();

  await app.listen(port);
}
bootstrap();

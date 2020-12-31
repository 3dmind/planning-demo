import { NestFactory } from '@nestjs/core';
import { ApiConfigService } from './api-config/api-config.service';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiConfigService = await app.resolve(ApiConfigService);
  app.useLogger(apiConfigService.getLogLevel());
  await app.listen(3000);
}

bootstrap();

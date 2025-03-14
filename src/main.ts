import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiPort = app.get(ConfigService).getDbConfig().port;

  // await databaseService.runMigrations(); // Применяем миграции при запуске

  await app.listen(apiPort);
  console.log(`Application run on port: ${apiPort}`);
}
bootstrap();

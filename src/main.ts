import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { DatabaseService } from './database/database.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiPort = app.get(ConfigService).getServerConf().port;
  const databaseService = app.get(DatabaseService);

  // Signal handler SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('Received SIGINT');
    await databaseService.onModuleDestroy(); // Close the connection to the database
    await app.close();
    process.exit(0);
  });

  await app.listen(apiPort);
  console.log(`Application run on port: ${apiPort}`);
}
bootstrap();
